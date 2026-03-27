import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
