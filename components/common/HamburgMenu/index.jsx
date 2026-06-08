const HamburgMenu = ({ className = '', barColor = '#10ac84', ...props }) => {
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
