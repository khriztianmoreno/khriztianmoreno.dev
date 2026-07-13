import React from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'content'> {
  content?: React.ReactNode;
  as?: HeadingTag;
  className?: string;
}

const Heading = ({ content, as: Tag = 'h2', className = '', ...props }: HeadingProps) => (
  <Tag className={className} {...props}>
    {content}
  </Tag>
);

export default Heading;
