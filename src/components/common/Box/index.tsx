import React from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  as?: string;
  className?: string;
}

const Box = ({
  children,
  as: Tag = 'div',
  className = '',
  ...props
}: BoxProps) => {
  const Component = Tag as React.ElementType;
  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

export default Box;
