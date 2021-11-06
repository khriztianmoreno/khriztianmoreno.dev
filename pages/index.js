import { ThemeProvider } from 'styled-components';
import Sticky from 'react-stickynode';

import SEO from '../components/common/SEO';
import { DrawerProvider } from '../components/common/contexts/DrawerContext';
import { portfolioTheme } from '../components/common/theme';
import { ResetCSS } from '../components/common/assets/css/style';
import {
  GlobalStyle,
  ContentWrapper,
} from '../components/containers/portfolio.style';

import HeroSection from '../components/containers/Hero';
import BioSection from '../components/containers/Bio';
import Navbar from '../components/containers/Navbar';
import AwardsSection from '../components/containers/Awards';
import Subscription from '../components/containers/Subscription';
import Footer from '../components/containers/Footer';

const Portfolio = () => {
  return (
    <ThemeProvider theme={portfolioTheme}>
      <>
        <SEO />
        <ResetCSS />
        <GlobalStyle />

        <ContentWrapper>
          <Sticky top={0} innerZ={9999} activeClass="sticky-nav-active">
            <DrawerProvider>
              <Navbar />
            </DrawerProvider>
          </Sticky>
          <HeroSection />
          <BioSection />
          <AwardsSection />
          {/* <Subscription /> */}
          <Footer />
        </ContentWrapper>
      </>
    </ThemeProvider>
  );
};
export default Portfolio;
