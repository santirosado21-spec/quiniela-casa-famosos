import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quiniela La Casa de los Famosos',
  description: 'Fantasy pool de eliminaciones con links únicos, picks bloqueados y leaderboard en vivo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
