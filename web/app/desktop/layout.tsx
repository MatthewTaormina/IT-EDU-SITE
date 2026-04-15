import Nav from '@/components/ui/Nav';

export default function DesktopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />
      <main id="main-content" className="flex-1 overflow-hidden">{children}</main>
    </>
  );
}
