import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (_req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: queue } = await supabase
    .from('embedding_flag_queue')
    .select('entity_id, image_url, image_id')
    .eq('entity_type', 'variant')
    .eq('status', 'pending')
    .limit(20)

  if (!queue?.length) {
    return new Response(JSON.stringify({ processed: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let processed = 0
  let failed = 0

  for (const item of queue) {
    try {
      // 1. Fetch image as base64
      const imgRes = await fetch(item.image_url)
      if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`)
      const imgBuffer = await imgRes.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)))
      const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg'

      // 2. Describe the image with GPT-4o-mini vision
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
                text: 'Describe this RC vehicle in one sentence: manufacturer, model name, scale, type (monster truck/crawler/buggy/short course/etc), and color. Be specific and concise.',
              },
            ],
          }],
        }),
      })
      const descData = await descRes.json()
      const description = descData.choices?.[0]?.message?.content ?? ''
      if (!description) throw new Error('Empty description from vision model')

      // 3. Embed the description
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
      const embedData = await embedRes.json()
      const vector = embedData.data?.[0]?.embedding
      if (!vector) throw new Error('No embedding returned')

      // 4. Store in variant_image_embeddings
      const { error: upsertErr } = await supabase
        .from('variant_image_embeddings')
        .upsert(
          {
            variant_id: item.entity_id,
            image_id: item.image_id,
            embedding: vector,
            embedding_model: 'text-embedding-3-small',
            source_url: item.image_url,
          },
          { onConflict: 'variant_id' }
        )

      if (upsertErr) throw upsertErr

      // 5. Mark queue item complete
      await supabase
        .from('embedding_flag_queue')
        .update({ status: 'complete', updated_at: new Date().toISOString() })
        .eq('entity_type', 'variant')
        .eq('entity_id', item.entity_id)

      processed++
    } catch (err) {
      console.error(`Failed ${item.entity_id}:`, err)
      await supabase
        .from('embedding_flag_queue')
        .update({ status: 'error', updated_at: new Date().toISOString() })
        .eq('entity_type', 'variant')
        .eq('entity_id', item.entity_id)
      failed++
    }
  }

  return new Response(JSON.stringify({ processed, failed, total: queue.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
