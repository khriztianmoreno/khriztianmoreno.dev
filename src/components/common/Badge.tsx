import Image, { type ImageProps } from 'next/image';

const BADGE_SRC =
  'https://res.cloudinary.com/khriztianmoreno/image/upload/v1784047696/km_site/insignia_full.png';

type BadgeProps = Omit<ImageProps, 'src' | 'alt'> & {
  alt?: string;
};

function Badge({
  alt = 'Khriztian Moreno — JS Developer Advocate & Community builder',
  ...props
}: BadgeProps) {
  return (
    <Image
      src={BADGE_SRC}
      alt={alt}
      width={1000}
      height={550}
      className="h-auto w-full"
      priority
      {...props}
    />
  );
}

export default Badge;
