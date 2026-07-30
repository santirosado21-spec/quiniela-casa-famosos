import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La quiniela de La Casa de los Famosos',
  description: 'Quiniela de eliminaciones con login por nombre/correo, picks bloqueados y leaderboard en vivo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
