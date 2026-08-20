import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduQuest RPG - Belajar Sambil Bertualang',
  description: 'Game RPG edukatif untuk murid SMP dengan AI Tutor Sage dan Google Gemini.',
  applicationName: 'EduQuest RPG',
  keywords: ['RPG edukatif', 'SMP', 'Gemini AI', 'Next.js', 'gamification'],
  authors: [{ name: 'EduQuest Team' }],
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
