import Navbar from '@/components/containers/Navbar';
import LanguageSwitcher from '@/components/blog/LanguageSwitcher';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar>
        <LanguageSwitcher />
      </Navbar>
      {children}
    </>
  );
}
