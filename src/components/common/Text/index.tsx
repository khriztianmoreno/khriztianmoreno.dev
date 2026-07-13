import React from 'react';

type TextTag = 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'label';

interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'content'> {
  content?: React.ReactNode;
  as?: TextTag;
  className?: string;
}

const Text = ({ content, as: Tag = 'p', className = '', ...props }: TextProps) => (
  <Tag className={className} {...props}>
    {content}
  </Tag>
);

export default Text;
