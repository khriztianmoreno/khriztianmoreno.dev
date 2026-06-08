interface LoaderProps {
  className?: string;
}

const Loader = ({ className = '' }: LoaderProps) => (
  <span className={`reusecore__loader text-success ${className}`} />
);

export default Loader;
