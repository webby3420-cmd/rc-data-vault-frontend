import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Strip data URI prefix if present
    const base64 = image.includes(',') ? image.split(',')[1] : image
    const mimeType = image.startsWith('data:')
      ? image.split(';')[0].split(':')[1]
      : 'image/jpeg'

    if (base64.length < 100) {
      return NextResponse.json({ error: 'Image too small or invalid' }, { status: 400 })
    }

    // Step 1: Describe the image with GPT-4o-mini vision
    const descRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' },
            },
            {
              type: 'text',
              text: 'Describe this RC vehicle in one sentence: manufacturer, model name, scale, type (monster truck/crawler/buggy/short course/etc), and color. If this is not an RC vehicle, say "not an RC vehicle". Be specific and concise.',
            },
          ],
        }],
      }),
    })

    if (!descRes.ok) {
      throw new Error(`Vision API error: ${descRes.status}`)
    }

    const descData = await descRes.json()
    const description = descData.choices?.[0]?.message?.content ?? ''

    if (description.toLowerCase().includes('not an rc vehicle')) {
      return NextResponse.json({
        results: [],
        message: 'Image does not appear to be an RC vehicle',
        description,
      })
    }

    // Step 2: Embed the description
    const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: description,
        dimensions: 1536,
      }),
    })

    if (!embedRes.ok) {
      throw new Error(`Embedding API error: ${embedRes.status}`)
    }

    const embedData = await embedRes.json()
    const embedding = embedData.data?.[0]?.embedding

    if (!embedding) {
      throw new Error('Failed to generate embedding')
    }

    // Step 3: Query identify_rc_vehicle RPC
    const { data: matches, error } = await (supabase.rpc as any)('identify_rc_vehicle', {
      p_query_embedding: embedding,
      p_top_k: 5,
      p_min_similarity: 0.3,
    })

    if (error) throw error

    const results = (matches ?? []).map((m: any) => ({
      variant_id: m.variant_id,
      variant_slug: m.variant_slug,
      variant_name: m.full_name,
      manufacturer_name: m.manufacturer,
      canonical_url: m.canonical_url,
      image_url: m.primary_image_url,
      confidence: m.similarity,
      fair_value: m.fair_value,
    }))

    return NextResponse.json({
      results,
      description,
      embedding_coverage: results.length > 0 ? 'active' : 'limited',
    })
  } catch (err) {
    console.error('[identify] error:', err)
    const message = err instanceof Error ? err.message : 'Identification failed'
    return NextResponse.json({
      error: message,
      results: [],
    }, { status: 500 })
  }
}
