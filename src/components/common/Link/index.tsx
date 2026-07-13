import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  className?: string;
}

const Link = ({ children, href, className = '', ...props }: LinkProps) => (
  <a href={href} className={`inline-block ${className}`} {...props}>
    {children}
  </a>
);

export default Link;
