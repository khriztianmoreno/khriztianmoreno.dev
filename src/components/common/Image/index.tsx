import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image = ({ src, alt, className = '', ...props }: ImageProps) => (
  <img
    src={src}
    alt={alt}
    className={`block max-w-full h-auto ${className}`}
    {...props}
  />
);

export default Image;
