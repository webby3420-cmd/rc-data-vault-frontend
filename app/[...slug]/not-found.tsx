export default function RouteNotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-slate-400">
          This RC Data Vault route is not currently published.
        </p>
      </div>
    </main>
  );
}
