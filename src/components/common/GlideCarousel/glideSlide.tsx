import React from 'react';

interface GlideSlideProps {
  children: React.ReactNode;
}

const GlideSlide = ({ children }: GlideSlideProps) => (
  <div className="glide__slide min-w-0">{children}</div>
);

export default GlideSlide;
