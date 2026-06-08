const Loader = ({ loaderColor = '#30C56D', className = '' }) => (
  <span
    className={`reusecore__loader ${className}`}
    style={{ color: loaderColor }}
  />
);

export default Loader;
