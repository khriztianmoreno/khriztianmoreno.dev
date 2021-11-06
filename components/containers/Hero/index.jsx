import React, { useEffect, useState } from 'react';

import { useSfx } from '../../common/hooks/useSfx';
import { usePool } from '../../common/hooks/usePoolFace';
import FaceDrop from '../../common/FaceDrop';
import Badge from '../../common/Badge';

import HeroWrapper from './styles';

export const taglines = [
  {
    rotation: '-9deg',
    size: '8.1vw',
    'size-lg': '55px',
    text: `
      has a lot of ideas
    `,
  },
  {
    rotation: '18deg',
    scale: '0.99',
    size: '9.1vw',
    'size-lg': '55px',
    text: `
      believes in us <span class="love"></span>
    `,
    top: '0',
  },
  {
    size: '8.9vw',
    'size-lg': '55px',
    text: `
      is an <span class="thumb-up"></span> speaker
    `,
  },
  {
    rotation: '-9deg',
    scale: '1',
    size: '8.1vw',
    'size-lg': '55px',
    text: `
      <span class="love">love</span>s to teach
    `,
  },
];

const CycleTagline = ({ clickHandler }) => {
  const [active, setActive] = useState(false);

  const images = {
    off: 'https://res.cloudinary.com/khriztianmoreno/image/upload/v1604543820/assets/rotate-off.png',
    on: 'https://res.cloudinary.com/khriztianmoreno/image/upload/v1604543820/assets/rotate-on.png',
  };

  const handleClick = (event) => {
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

  useEffect(() => {
    addPool();
  }, []);

  function cycleTagline() {
    addPool();
    playBoop();

    const index = taglineIndex + 1;
    setTaglineIndex(index < taglines.length ? index : 0);
  }

  return (
    <HeroWrapper id="banner_section">
      <FaceDrop className="boops" />
      <h1 className="hero">
        <Badge />
        <span
          className="hero-tagline"
          style={{
            '--top': tagline.top || '-7px',
            '--rotation': tagline['rotation'] || '0deg',
            '--scale': tagline.scale || 1.1,
            '--size': tagline.size || '8.1vw',
            '--size-lg': tagline['size-lg'] || '44px',
          }}
          dangerouslySetInnerHTML={{ __html: tagline.text }}
        />
      </h1>
      <CycleTagline clickHandler={cycleTagline} />
    </HeroWrapper>
  );
}

export default Hero;
