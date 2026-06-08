import React from 'react';

interface LogoProps {
  logoSrc?: string;
  title?: string;
  href?: string;
  className?: string;
  logoStyle?: React.CSSProperties;
}

const Logo = ({ logoSrc, title, href = '#', className = '', logoStyle = {} }: LogoProps) => (
  <a href={href} className={`inline-block mr-4 ${className}`}>
    {logoSrc ? (
      <img src={logoSrc} alt={title} style={logoStyle} className="max-w-[120px] md:max-w-[130px]" />
    ) : (
      <span>{title}</span>
    )}
  </a>
);

export default Logo;
