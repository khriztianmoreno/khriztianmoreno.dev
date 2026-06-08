import { useEffect } from 'react';

import SEO from '../components/common/SEO';
import HeroSection from '../components/containers/Hero';
import BioSection from '../components/containers/Bio';
import Navbar from '../components/containers/Navbar';
import AwardsSection from '../components/containers/Awards';
import Footer from '../components/containers/Footer';

const Portfolio = () => {
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        document.body.classList.add('sticky-nav-active');
      } else {
        document.body.classList.remove('sticky-nav-active');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('sticky-nav-active');
    };
  }, []);

  return (
    <>
      <SEO />
      <div className="content-overflow-hidden">
        <Navbar />
        <HeroSection />
        <BioSection />
        <AwardsSection />
        <Footer />
      </div>
    </>
  );
};

export default Portfolio;
