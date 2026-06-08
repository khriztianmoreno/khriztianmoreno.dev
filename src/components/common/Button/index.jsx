import Loader from '../Loader';

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
}) => {
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
