import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Monitor de Vendas',
  description: 'Table carousel with time periods',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
            <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}