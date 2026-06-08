const Container = ({ children, className = '', noGutter, mobileGutter, width }) => {
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
