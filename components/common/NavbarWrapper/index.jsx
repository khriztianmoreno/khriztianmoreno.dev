const NavbarWrapper = ({ children, className = '', ...props }) => (
  <nav className={`portfolio_navbar ${className}`} {...props}>
    {children}
  </nav>
);

export default NavbarWrapper;
