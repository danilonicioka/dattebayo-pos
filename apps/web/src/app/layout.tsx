import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dattebayo POS',
  description: 'Sistema de Gerenciamento Dattebayo',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
