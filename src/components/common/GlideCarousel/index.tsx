import React, { useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface CarouselOptions {
  type?: string;
  autoplay?: number;
  gap?: number;
}

interface GlideCarouselProps {
  children: React.ReactNode;
  options?: CarouselOptions;
  prevButton?: React.ReactNode;
  nextButton?: React.ReactNode;
  carouselSelector?: string;
}

const GlideCarousel = ({
  children,
  options = {},
  prevButton,
  nextButton,
  carouselSelector,
}: GlideCarouselProps) => {
  const autoplayDelay = options.autoplay ?? 0;
  const plugins = autoplayDelay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: options.type === 'carousel' },
    plugins
  );

  const trackRef = useRef<HTMLDivElement>(null);

  // Inject the runtime `gap` value as a CSS variable on the track element
  // so the static `gap-[var(--glide-gap)]` utility can read it.
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.setProperty('--glide-gap', `${options.gap ?? 0}px`);
    }
  }, [options.gap]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div id={carouselSelector} className="relative">
      <div className="glide__controls absolute right-0 -top-39">
        <div onClick={scrollPrev} className="cursor-pointer">
          {prevButton}
        </div>
        <div onClick={scrollNext} className="cursor-pointer">
          {nextButton}
        </div>
      </div>
      <div ref={emblaRef} className="overflow-hidden">
        <div ref={trackRef} className="flex gap-(--glide-gap)">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlideCarousel;
