'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Flame, Rocket } from 'lucide-react';

import FadeIn from '../../common/FadeIn';
import { TIMELINE, type TimelineEntry } from '@/data/timeline';

function getMeta(entry: TimelineEntry) {
  if (entry.type === 'workshop') {
    return { label: entry.org, description: entry.description };
  }

  if (entry.type === 'post') {
    return { label: entry.theme, description: entry.description };
  }

  if (entry.event) {
    return {
      label: entry.event,
      description: [entry.location, entry.format].filter(Boolean).join(' · '),
    };
  }

  return { label: undefined, description: entry.description };
}

const MilestonesSection = () => {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ['start start', 'end end'],
  });
  const rocketTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      id="milestones_section"
      className="relative overflow-hidden px-6 py-30"
    >
      <div className="mx-auto mb-24 max-w-300 text-center">
        <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
          Journey
        </span>
        <h2 className="mb-5 font-display text-4xl md:text-6xl">
          Talks &amp; Workshops
        </h2>
        <p className="m-0 text-base font-normal leading-normal text-on-surface-variant">
          A passport of international conferences, hands-on workshops, and
          technical articles shared across the JavaScript and AI web ecosystem.
        </p>
      </div>

      <div ref={lineRef} className="relative mx-auto max-w-4xl">
        <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />

        <motion.div
          aria-hidden="true"
          className="scroll-rocket hidden md:block"
          style={{ top: rocketTop }}
        >
          <Flame className="scroll-rocket-flame" size={20} />
          <Rocket className="scroll-rocket-icon" size={30} />
        </motion.div>

        {TIMELINE.map((entry, index) => {
          const isRight = index % 2 === 1;
          const { label, description } = getMeta(entry);

          return (
            <FadeIn
              key={`${entry.type}-${entry.sortKey}-${entry.title}`}
              delay={Math.min(index, 8) * 0.1}
              className="relative mb-12 flex items-center justify-between last:mb-0 md:mb-24"
            >
              {!isRight && <div className="hidden w-5/12 md:block" />}

              <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-neon md:block" />

              <div
                className={`glass-card w-full p-8 md:w-5/12 ${
                  isRight ? 'md:text-right' : ''
                }`}
              >
                <span className="mb-2 block font-display text-2xl text-primary">
                  {entry.displayDate}
                </span>
                <h3 className="mb-3 text-xl font-bold">
                  {entry.type === 'post' ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {entry.title}
                    </a>
                  ) : (
                    entry.title
                  )}
                </h3>
                {(label || description) && (
                  <p className="text-on-surface-variant">
                    {label && (
                      <span className="font-semibold text-on-surface">
                        {label}
                      </span>
                    )}
                    {label && description && ' — '}
                    {description}
                  </p>
                )}
              </div>

              {isRight && <div className="hidden w-5/12 md:block" />}
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
};

export default MilestonesSection;
