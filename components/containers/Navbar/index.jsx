import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { DrawerContext } from '../../common/contexts/DrawerContext';
import { MENU_ITEMS } from '../../common/assets/data';
import Box from '../../common/Box';
import Container from '../../common/UI/Container';
import Drawer from '../../common/Drawer';
import HamburgMenu from '../../common/HamburgMenu';
import Logo from '../../common/UI/Elements/Logo';
import NavbarWrapper from '../../common/NavbarWrapper';
import ScrollSpyMenu from '../../common/ScrollSpyMenu';

import LogoImage from '../../common/assets/image/portfolio/logo.png';
import LogoImageAlt from '../../common/assets/image/portfolio/logo-alt.png';

const Navbar = ({ navbarStyle, logoStyle, row, menuWrapper }) => {
  const { state, dispatch } = useContext(DrawerContext);

  // Toggle drawer
  const toggleHandler = () => {
    dispatch({
      type: 'TOGGLE',
    });
  };

  return (
    <NavbarWrapper {...navbarStyle} className="portfolio_navbar">
      <Container noGutter mobileGutter width="1200px">
        <Box {...row}>
          <Logo
            href="#"
            logoSrc={LogoImage?.src}
            title="Portfolio"
            logoStyle={logoStyle}
            className="main-logo"
          />
          <Logo
            href="#"
            logoSrc={LogoImageAlt?.src}
            title="Portfolio"
            logoStyle={logoStyle}
            className="logo-alt"
          />
          <Box {...menuWrapper}>
            <ScrollSpyMenu
              className="main_menu"
              menuItems={MENU_ITEMS}
              offset={-70}
            />
            <Drawer
              width="420px"
              placement="right"
              drawerHandler={<HamburgMenu barColor="#00F6BB" />}
              open={state.isOpen}
              toggleHandler={toggleHandler}
            >
              <ScrollSpyMenu
                className="mobile_menu"
                menuItems={MENU_ITEMS}
                drawerClose={true}
                offset={-100}
              />
            </Drawer>
          </Box>
        </Box>
      </Container>
    </NavbarWrapper>
  );
};

Navbar.propTypes = {
  navbarStyle: PropTypes.object,
  logoStyle: PropTypes.object,
  button: PropTypes.object,
  row: PropTypes.object,
  menuWrapper: PropTypes.object,
};

Navbar.defaultProps = {
  navbarStyle: {
    minHeight: '70px',
    display: 'block',
  },
  row: {
    flexBox: true,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoStyle: {
    maxWidth: ['120px', '130px'],
  },
  button: {
    type: 'button',
    fontSize: '16px',
    pl: '0',
    pr: '0',
    colors: 'primary',
    minHeight: 'auto',
  },
  menuWrapper: {
    flexBox: true,
    alignItems: 'center',
  },
};

export default Navbar;
