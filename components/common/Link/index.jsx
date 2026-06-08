const Link = ({ children, href, className = '', ...props }) => (
  <a href={href} className={`inline-block ${className}`} {...props}>
    {children}
  </a>
);

export default Link;
