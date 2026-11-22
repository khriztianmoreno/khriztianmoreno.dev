import { type Lang } from '@/lib/blog/schema';

/** The six characters, one image each in `public/buddies/`. */
export type BuddyId = 'cool' | 'dance' | 'laptop' | 'question' | 'star' | 'chill';

/** Reading moments that can bring a buddy on screen. */
export type BuddyMoment = 'intro' | 'progress30' | 'progress60' | 'idle' | 'comments' | 'finish';

interface BuddyLine {
  buddy: BuddyId;
  /** A random variant is picked each time, so repeat visits feel less canned. */
  lines: Record<Lang, string[]>;
}

/**
 * Who shows up at each moment and what they say. Edit freely: to add a
 * line, push another string to the `en`/`es` arrays.
 */
export const BUDDY_SCRIPT: Record<BuddyMoment, BuddyLine> = {
  intro: {
    buddy: 'cool',
    lines: {
      en: ['Get comfy, this one gets good.', 'Grab a coffee. I’ll be around.'],
      es: ['Ponte cómodo, esto se pone bueno.', 'Ve por un café, yo te acompaño.'],
    },
  },
  progress30: {
    buddy: 'dance',
    lines: {
      en: ['You’re doing great! Keep going.', 'A third of the way already!'],
      es: ['¡Vas muy bien! Sigue así.', '¡Ya vas por un tercio!'],
    },
  },
  progress60: {
    buddy: 'laptop',
    lines: {
      en: ['Tip: copy the code and try it yourself.', 'Reading is good. Running the code is better.'],
      es: ['Tip: copia el código y pruébalo tú mismo.', 'Leer está bien. Correr el código, mejor.'],
    },
  },
  idle: {
    buddy: 'chill',
    lines: {
      en: ['Still there? Take a break, I’ll wait. ☕', 'No rush. The post isn’t going anywhere.'],
      es: ['¿Sigues ahí? Tómate un café, yo espero. ☕', 'Sin afán, el post no se va a ningún lado.'],
    },
  },
  comments: {
    buddy: 'question',
    lines: {
      en: ['Questions? Drop them in the comments.', 'Did something not click? Ask below!'],
      es: ['¿Dudas? Déjalas en los comentarios.', '¿Algo no te cuadró? ¡Pregunta abajo!'],
    },
  },
  finish: {
    buddy: 'star',
    lines: {
      en: ['You made it to the end! 🏆', 'Done! You’re a legend. 🏆'],
      es: ['¡Llegaste al final! 🏆', '¡Terminaste! Eres un crack. 🏆'],
    },
  },
};

export const BUDDY_UI: Record<Lang, { close: string; mute: string; label: string }> = {
  en: { close: 'Close', mute: 'Don’t show again', label: 'Reading buddy' },
  es: { close: 'Cerrar', mute: 'No mostrar más', label: 'Compañero de lectura' },
};
