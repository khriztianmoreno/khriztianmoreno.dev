import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  noGutter?: boolean;
  mobileGutter?: boolean;
  fullWidth?: boolean;
}

const Container = ({
  children,
  className = '',
  noGutter,
  mobileGutter,
  fullWidth,
}: ContainerProps) => {
  const classes = [
    'container',
    noGutter ? 'no-gutter' : '',
    mobileGutter ? 'mobile-gutter' : '',
    fullWidth ? 'max-w-300' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

export default Container;
