const Image = ({ src, alt, className = '', ...props }) => (
  <img
    src={src}
    alt={alt}
    className={`block max-w-full h-auto ${className}`}
    {...props}
  />
);

export default Image;
