import { usePool } from './hooks/usePoolFace';

interface FaceDropProps {
  className?: string;
}

function FaceDrop({ className }: FaceDropProps) {
  const { poolRef } = usePool();

  return (
    <canvas
      ref={poolRef}
      className={`absolute top-0 left-0 h-full w-full ${className ?? ''}`}
    />
  );
}

export default FaceDrop;
