import React from 'react';

interface HamburgMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const HamburgMenu = ({ className = '', ...props }: HamburgMenuProps) => {
  const classes = ['hamburgMenu__bar', 'text-teal', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} aria-label="Open menu" {...props}>
      <span />
      <span />
      <span />
    </button>
  );
};

export default HamburgMenu;
