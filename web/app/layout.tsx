import type { Metadata } from 'next';
import Script from 'next/script';
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
  metadataBase: new URL('https://it-edu-website.netlify.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex flex-col min-h-full">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Skip link — WCAG 2.4.1 / AODA: first focusable element on every page */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <Nav />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
