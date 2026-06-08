interface LogoProps {
  logoSrc?: string;
  title?: string;
  href?: string;
  className?: string;
}

const Logo = ({ logoSrc, title, href = '#', className = '' }: LogoProps) => (
  <a href={href} className={`inline-block mr-4 ${className}`}>
    {logoSrc ? (
      <img src={logoSrc} alt={title} className="max-w-30 md:max-w-32" />
    ) : (
      <span>{title}</span>
    )}
  </a>
);

export default Logo;
