import { useState } from 'react';

import { MENU_ITEMS } from '../../common/assets/data';
import Container from '../../common/UI/Container';
import Drawer from '../../common/Drawer';
import HamburgMenu from '../../common/HamburgMenu';
import Logo from '../../common/UI/Elements/Logo';
import NavbarWrapper from '../../common/NavbarWrapper';
import ScrollSpyMenu from '../../common/ScrollSpyMenu';

import LogoImage from '../../common/assets/image/portfolio/logo.png';
import LogoImageAlt from '../../common/assets/image/portfolio/logo-alt.png';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <NavbarWrapper className="portfolio_navbar">
      <Container noGutter mobileGutter fullWidth>
        <div className="flex items-center justify-between w-full">
          <Logo
            href="#"
            logoSrc={LogoImage?.src}
            title="Portfolio"
            className="main-logo"
          />
          <Logo
            href="#"
            logoSrc={LogoImageAlt?.src}
            title="Portfolio"
            className="logo-alt"
          />

          <div className="flex items-center">
            <ScrollSpyMenu className="main_menu" menuItems={MENU_ITEMS} />
            <div className="hamburger-btn">
              <Drawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                drawerHandler={<HamburgMenu className="text-green" />}
              >
                <ScrollSpyMenu
                  className="mobile_menu"
                  menuItems={MENU_ITEMS}
                  onClose={() => setDrawerOpen(false)}
                />
              </Drawer>
            </div>
          </div>
        </div>
      </Container>
    </NavbarWrapper>
  );
};

export default Navbar;
