import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  noGutter?: boolean;
  mobileGutter?: boolean;
  width?: string;
}

const Container = ({ children, className = '', noGutter, mobileGutter, width }: ContainerProps) => {
  const classes = [
    'container',
    noGutter ? 'no-gutter' : '',
    mobileGutter ? 'mobile-gutter' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={width ? { maxWidth: width } : undefined}>
      {children}
    </div>
  );
};

export default Container;
