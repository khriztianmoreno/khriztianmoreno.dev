import React from 'react';

interface HamburgMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  barColor?: string;
}

const HamburgMenu = ({ className = '', barColor = '#10ac84', ...props }: HamburgMenuProps) => {
  const classes = ['hamburgMenu__bar', className].filter(Boolean).join(' ');
  return (
    <button className={classes} aria-label="Open menu" {...props}>
      <span style={{ backgroundColor: barColor }} />
      <span style={{ backgroundColor: barColor }} />
      <span style={{ backgroundColor: barColor }} />
    </button>
  );
};

export default HamburgMenu;
