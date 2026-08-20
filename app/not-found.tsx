import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-md text-center">
        <p className="text-6xl">🧭</p>
        <h1 className="mt-4 text-3xl font-bold">Quest tidak ditemukan</h1>
        <p className="mt-2 text-muted-foreground">Rute ini belum dibuka di peta EduQuest.</p>
        <Button asChild className="mt-6"><Link href="/">Kembali ke Portal</Link></Button>
      </section>
    </main>
  );
}
