'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { type Lang } from '@/lib/blog/schema';
import { BUDDY_SCRIPT, BUDDY_UI, type BuddyId, type BuddyMoment } from './buddies';
import styles from './BlogBuddies.module.css';

interface BlogBuddiesProps {
  lang: Lang;
}

interface Appearance {
  moment: BuddyMoment;
  buddy: BuddyId;
  text: string;
}

const MUTE_KEY = 'blog-buddies:muted';
const INTRO_DELAY_MS = 3500;
const IDLE_AFTER_MS = 30_000;
const EXIT_MS = 450;
const GAP_BETWEEN_MS = 1200;
/** On screen long enough to read: ~90 ms per character, never under 5 s. */
const displayMs = (text: string) => Math.max(5000, text.length * 90);

/** Scroll milestones, in order. Reaching one drops any earlier one still queued. */
const PROGRESS: { moment: BuddyMoment; at: number }[] = [
  { moment: 'progress30', at: 0.3 },
  { moment: 'progress60', at: 0.6 },
  { moment: 'finish', at: 0.97 },
];

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Reading buddies: small characters that pop into the bottom-right corner at
 * key moments of a post (start, 30 % and 60 % read, idle, comments, end),
 * say one line and leave. One at a time, each moment at most once per page
 * view, and a "don't show again" switch remembered in localStorage.
 *
 * Expects the post body to carry `data-post-body` and the comments widget
 * the `giscus` class (see `PostDetail` and `Comments`).
 */
export default function BlogBuddies({ lang }: BlogBuddiesProps) {
  const [current, setCurrent] = useState<Appearance | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);

  const queue = useRef<BuddyMoment[]>([]);
  const seen = useRef(new Set<BuddyMoment>());
  const busy = useRef(false);
  const hiding = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const remaining = useRef(0);
  const shownAt = useRef(0);

  const showNext = useCallback(() => {
    if (busy.current) return;
    const moment = queue.current.shift();
    if (!moment) return;
    busy.current = true;
    hiding.current = false;
    const { buddy, lines } = BUDDY_SCRIPT[moment];
    setLeaving(false);
    setCurrent({ moment, buddy, text: pick(lines[lang]) });
  }, [lang]);

  const hide = useCallback(() => {
    // The close button and the auto-hide timer can both fire.
    if (hiding.current) return;
    hiding.current = true;
    clearTimeout(hideTimer.current);
    setLeaving(true);
    setTimeout(() => {
      setCurrent(null);
      setTimeout(() => {
        busy.current = false;
        showNext();
      }, GAP_BETWEEN_MS);
    }, EXIT_MS);
  }, [showNext]);

  const enqueue = useCallback(
    (moment: BuddyMoment) => {
      if (seen.current.has(moment)) return;
      seen.current.add(moment);
      const rank = PROGRESS.findIndex((p) => p.moment === moment);
      if (rank > 0) {
        // Jumped ahead: "keep going!" makes no sense once you've finished.
        const earlier = new Set(PROGRESS.slice(0, rank).map((p) => p.moment));
        queue.current = queue.current.filter((m) => !earlier.has(m));
      }
      queue.current.push(moment);
      showNext();
    },
    [showNext]
  );

  // Auto-hide timer, restarted for each appearance.
  useEffect(() => {
    if (!current) return;
    remaining.current = displayMs(current.text);
    shownAt.current = Date.now();
    hideTimer.current = setTimeout(hide, remaining.current);
    return () => clearTimeout(hideTimer.current);
  }, [current, hide]);

  // Read the mute flag after mount (localStorage isn't available on the server).
  useEffect(() => {
    setMuted(readMuted());
  }, []);

  // Triggers.
  useEffect(() => {
    if (muted) return;
    const body = document.querySelector<HTMLElement>('[data-post-body]');
    if (!body) return;

    const introTimer = setTimeout(() => enqueue('intro'), INTRO_DELAY_MS);

    let scrolled = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const armIdle = () => {
      clearTimeout(idleTimer);
      if (!scrolled || seen.current.has('idle')) return;
      idleTimer = setTimeout(() => {
        if (document.visibilityState === 'visible') enqueue('idle');
      }, IDLE_AFTER_MS);
    };

    let frame = 0;
    const onScroll = () => {
      scrolled = true;
      armIdle();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = body.getBoundingClientRect();
        const read = (window.innerHeight - rect.top) / rect.height;
        // Only the furthest milestone reached: jumping straight to the end
        // should bring the "you finished" buddy, not "keep going!" first.
        const reached = PROGRESS.filter((p) => read >= p.at);
        if (reached.length === 0) return;
        reached.slice(0, -1).forEach((p) => seen.current.add(p.moment));
        enqueue(reached[reached.length - 1].moment);
      });
    };

    const onActivity = () => armIdle();

    const comments = document.querySelector('.giscus');
    const observer = comments
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) enqueue('comments');
          },
          { threshold: 0.15 }
        )
      : null;
    if (comments) observer?.observe(comments);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(idleTimer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [muted, enqueue]);

  // Hovering keeps the buddy around; leaving resumes the countdown.
  const pause = () => {
    clearTimeout(hideTimer.current);
    remaining.current -= Date.now() - shownAt.current;
  };
  const resume = () => {
    shownAt.current = Date.now();
    hideTimer.current = setTimeout(hide, Math.max(remaining.current, 1500));
  };

  const mute = () => {
    try {
      window.localStorage.setItem(MUTE_KEY, '1');
    } catch {
      // Private mode or blocked storage: muting still applies to this visit.
    }
    queue.current = [];
    setMuted(true);
    hide();
  };

  if (!current) return null;
  const ui = BUDDY_UI[lang];

  return (
    <aside
      className={styles.root}
      data-leaving={leaving || undefined}
      aria-label={ui.label}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className={styles.bubble} role="status">
        <button type="button" className={styles.close} onClick={hide} aria-label={ui.close}>
          ×
        </button>
        <p className={styles.text}>{current.text}</p>
        <button type="button" className={styles.mute} onClick={mute}>
          {ui.mute}
        </button>
      </div>
      <div className={styles.buddy}>
        <div className={styles.idle} data-buddy={current.buddy}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/buddies/${current.buddy}.webp`} alt="" width={140} height={140} draggable={false} />
        </div>
      </div>
    </aside>
  );
}
