const Logo = ({ logoSrc, title, href = '#', className = '', logoStyle = {} }) => (
  <a href={href} className={`inline-block mr-4 ${className}`}>
    {logoSrc ? (
      <img src={logoSrc} alt={title} style={logoStyle} className="max-w-[120px] md:max-w-[130px]" />
    ) : (
      <span>{title}</span>
    )}
  </a>
);

export default Logo;
