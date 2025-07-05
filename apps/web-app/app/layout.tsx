import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'System Faktur - Nowoczesny system zarządzania fakturami',
  description: 'Profesjonalny system do zarządzania klientami i fakturami z integracją RabbitMQ',
  keywords: 'faktury, system faktur, zarządzanie klientami, RabbitMQ, Next.js',
  authors: [{ name: 'System Faktur Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
} 