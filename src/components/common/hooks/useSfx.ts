import { useSettings } from '../contexts/Settings';

const sfxCache: Record<string, HTMLAudioElement> = {};

interface SoundOptions {
  soundEnabled: boolean | undefined;
  volume?: number;
  interrupt?: boolean;
}

function useSound(url: string, { soundEnabled }: SoundOptions): [() => void] {
  if (!soundEnabled) {
    return [() => {}];
  }

  try {
    if (sfxCache[url]) {
      return [() => { void sfxCache[url].play(); }];
    } else {
      const sfx = new Audio(url);
      sfxCache[url] = sfx;

      return [() => { void sfxCache[url].play(); }];
    }
  } catch (_e) {
    return [() => {}];
  }
}

export interface SfxHandlers {
  playAirhorn: () => void;
  playBoop: () => void;
  playClick: () => void;
  playHooray: () => void;
  playPop: () => void;
  playPowerUp: () => void;
  playPowerDown: () => void;
}

export function useSfx(): SfxHandlers {
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
