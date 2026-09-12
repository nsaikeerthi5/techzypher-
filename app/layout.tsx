import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aethelgard: Life RPG | Forge Your Hero Through Real-World Quests',
  description:
    'A tactile, full-stack gamified productivity RPG that transforms daily habits, fitness, and study into heroic experience, gold, and epic character progression.',
  keywords: ['Life RPG', 'Gamified Productivity', 'Habit Tracker', 'RPG Todo', 'Task Manager'],
  authors: [{ name: 'Aethelgard RPG' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-rpg-darkest text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
