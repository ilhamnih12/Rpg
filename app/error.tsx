'use client';

import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="max-w-lg rounded-3xl border bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-3xl">⚠️</div>
        <h1 className="text-2xl font-bold">Portal terkena gangguan</h1>
        <p className="mt-3 text-muted-foreground">{error.message || 'Terjadi kesalahan tak terduga.'}</p>
        <Button className="mt-6" onClick={reset}>Coba lagi</Button>
      </section>
    </main>
  );
}
