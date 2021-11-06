import { usePool } from './hooks/usePoolFace';

function FaceDrop({ className }) {
  const { poolRef } = usePool();

  return (
    <canvas
      ref={poolRef}
      className={className}
      style={{
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      }}
    />
  );
}

export default FaceDrop;
