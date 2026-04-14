import type { Metadata } from 'next';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'IT Learning Hub',
    template: '%s | IT Learning Hub',
  },
  description:
    'Free, structured learning pathways from zero knowledge to job-ready web development skills.',
  metadataBase: new URL('https://it-learning-hub.netlify.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
