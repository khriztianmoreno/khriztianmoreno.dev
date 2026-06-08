import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const GlideCarousel = ({
  children,
  options = {},
  prevButton,
  nextButton,
  carouselSelector,
}) => {
  const autoplayDelay = options.autoplay || 0;
  const plugins = autoplayDelay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: options.type === 'carousel' },
    plugins
  );

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div id={carouselSelector} style={{ position: 'relative' }}>
      <div
        className="glide__controls"
        style={{ position: 'absolute', top: -155, right: 0 }}
      >
        <div onClick={scrollPrev} style={{ cursor: 'pointer' }}>
          {prevButton}
        </div>
        <div onClick={scrollNext} style={{ cursor: 'pointer' }}>
          {nextButton}
        </div>
      </div>
      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: (options.gap || 0) + 'px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlideCarousel;
