import React from 'react';
import Loader from '../Loader';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  iconPosition?: 'left' | 'right';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
  loaderColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Button = ({
  type = 'button',
  title,
  icon,
  disabled = false,
  iconPosition = 'right',
  onClick,
  isLoading = false,
  loaderColor,
  className = '',
  style,
  ...props
}: ButtonProps) => {
  const classes = ['reusecore__button', className].filter(Boolean).join(' ');

  const buttonIcon = isLoading ? (
    <Loader loaderColor={loaderColor || '#30C56D'} />
  ) : (
    icon && <span className="btn-icon">{icon}</span>
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...props}
    >
      {iconPosition === 'left' && buttonIcon}
      {title && <span className="btn-text">{title}</span>}
      {iconPosition === 'right' && buttonIcon}
    </button>
  );
};

export default Button;
