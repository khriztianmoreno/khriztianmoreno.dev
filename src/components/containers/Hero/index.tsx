import React, { useEffect, useRef, useState } from 'react';

import { useSfx } from '../../common/hooks/useSfx';
import { usePool } from '../../common/hooks/usePoolFace';
import FaceDrop from '../../common/FaceDrop';
import Badge from '../../common/Badge';

interface TaglineItem {
  rotation?: string;
  size?: string;
  'size-lg'?: string;
  text: string;
  top?: string;
  scale?: string;
}

export const taglines: TaglineItem[] = [
  {
    rotation: '-9deg',
    size: '8.1vw',
    'size-lg': '55px',
    text: 'has a lot of ideas',
  },
  {
    rotation: '18deg',
    scale: '0.99',
    size: '9.1vw',
    'size-lg': '55px',
    text: 'believes in us <span class="love"></span>',
    top: '0',
  },
  {
    size: '8.9vw',
    'size-lg': '55px',
    text: 'is an <span class="thumb-up"></span> speaker',
  },
  {
    rotation: '-9deg',
    scale: '1',
    size: '8.1vw',
    'size-lg': '55px',
    text: '<span class="love">love</span>s to teach',
  },
];

interface CycleTaglineProps {
  clickHandler: () => void;
}

const CycleTagline = ({ clickHandler }: CycleTaglineProps) => {
  const [active, setActive] = useState(false);

  const images: Record<'off' | 'on', string> = {
    off: 'https://res.cloudinary.com/khriztianmoreno/image/upload/v1604543820/assets/rotate-off.png',
    on: 'https://res.cloudinary.com/khriztianmoreno/image/upload/v1604543820/assets/rotate-on.png',
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActive(true);
    setTimeout(() => setActive(false), 500);
    clickHandler();
  };

  return (
    <a
      href="#hero-tagline"
      onClick={handleClick}
      className={`cycle ${active ? 'active' : ''}`}
    >
      <img
        src={images[active ? 'on' : 'off']}
        alt="drawing of two arrows pointing in a circle"
      />
      <span className="push-me">push me</span>
    </a>
  );
};

function Hero() {
  const { addPool } = usePool();
  const { playBoop } = useSfx();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const tagline = taglines[taglineIndex];
  const taglineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    addPool();
  }, []);

  // Tagline rotation/scale/size come from runtime data, so they are exposed
  // as CSS variables through `setProperty` to avoid inline `style` props.
  useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;
    el.style.setProperty('--top', tagline?.top ?? '-7px');
    el.style.setProperty('--rotation', tagline?.rotation ?? '0deg');
    el.style.setProperty('--scale', String(tagline?.scale ?? 1.1));
    el.style.setProperty('--size', tagline?.size ?? '8.1vw');
    el.style.setProperty('--size-lg', tagline?.['size-lg'] ?? '44px');
  }, [tagline]);

  function cycleTagline() {
    addPool();
    playBoop();
    const index = taglineIndex + 1;
    setTaglineIndex(index < taglines.length ? index : 0);
  }

  return (
    <section className="hero-wrapper" id="banner_section">
      <FaceDrop className="boops" />
      <h1 className="hero">
        <Badge />
        <span
          ref={taglineRef}
          className="hero-tagline"
          dangerouslySetInnerHTML={{ __html: tagline?.text ?? '' }}
        />
      </h1>
      <CycleTagline clickHandler={cycleTagline} />
    </section>
  );
}

export default Hero;
