import { useSettings } from '../contexts/Settings';

const sfxCache = {};

function useSound(url, { soundEnabled }) {
  if (!soundEnabled) {
    return [() => {}];
  }

  try {
    if (sfxCache[url]) {
      return [() => sfxCache[url].play()];
    } else {
      const sfx = new Audio(url);
      sfxCache[url] = sfx;

      return [() => sfxCache[url].play()];
    }
  } catch (e) {
    return [() => {}];
  }
}

export function useSfx() {
  const { soundEnabled } = useSettings();

  const [playBoop] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/boop.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  const [playPop] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/pop.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  const [playClick] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/click.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  const [playAirhorn] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/airhorn.mp3',
    {
      soundEnabled,
      volume: 0.5,
      interrupt: true,
    }
  );

  const [playPowerUp] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/power-up.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  const [playPowerDown] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/power-down.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  const [playHooray] = useSound(
    'https://res.cloudinary.com/khriztianmoreno/video/upload/km_site/sfx/hooray.mp3',
    {
      soundEnabled,
      volume: 0.5,
    }
  );

  return {
    playAirhorn,
    playBoop,
    playClick,
    playHooray,
    playPop,
    playPowerUp,
    playPowerDown,
  };
}
