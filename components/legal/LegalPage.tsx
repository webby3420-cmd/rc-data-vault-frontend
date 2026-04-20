export function LegalPage({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <article className="max-w-none">
      <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
        {title}
      </h1>
      <div className="legal-body">{children}</div>
    </article>
  )
}
