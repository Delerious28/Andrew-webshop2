import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Remoof | Modern Bicycle Parts',
  description: 'Premium ecommerce for precision bicycle components.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
