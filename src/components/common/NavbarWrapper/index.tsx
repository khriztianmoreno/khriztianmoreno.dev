import React from 'react';

interface NavbarWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

const NavbarWrapper = ({ children, className = '', ...props }: NavbarWrapperProps) => (
  <nav className={`portfolio_navbar ${className}`} {...props}>
    {children}
  </nav>
);

export default NavbarWrapper;
