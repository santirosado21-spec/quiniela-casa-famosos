import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quiniela La Casa de los Famosos México 2026',
  description: 'Quiniela de eliminaciones con login por nombre/correo, picks bloqueados y leaderboard en vivo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
