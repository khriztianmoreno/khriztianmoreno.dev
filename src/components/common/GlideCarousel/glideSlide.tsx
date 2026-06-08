import React from 'react';

interface GlideSlideProps {
  children: React.ReactNode;
  perView?: number;
}

const GlideSlide = ({ children, perView = 4 }: GlideSlideProps) => (
  <div
    className="glide__slide"
    style={{ '--per-view': perView, minWidth: 0 } as React.CSSProperties}
  >
    {children}
  </div>
);

export default GlideSlide;
