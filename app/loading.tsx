export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-card">
        <div className="mb-5 h-8 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
