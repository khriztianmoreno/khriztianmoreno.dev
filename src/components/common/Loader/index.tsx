interface LoaderProps {
  loaderColor?: string;
  className?: string;
}

const Loader = ({ loaderColor = '#30C56D', className = '' }: LoaderProps) => (
  <span
    className={`reusecore__loader ${className}`}
    style={{ color: loaderColor }}
  />
);

export default Loader;
