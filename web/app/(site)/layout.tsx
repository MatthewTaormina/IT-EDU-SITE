import Nav from '@/components/ui/Nav';
import Footer from '@/components/ui/Footer';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
