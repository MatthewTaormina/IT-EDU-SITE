import type { Metadata } from 'next';
import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';
import ThemeProvider from '@/components/ui/ThemeProvider';
import './globals.css';

// Runs synchronously before first paint — prevents flash of wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}catch(e){}})();`;

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex flex-col min-h-full">
        <ThemeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
