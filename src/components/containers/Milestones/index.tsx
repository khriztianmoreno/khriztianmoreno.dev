'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Flame, Rocket } from 'lucide-react';
import Link from 'next/link';

import FadeIn from '../../common/FadeIn';
import { TIMELINE, type TimelineEntry } from '@/data/timeline';
import TechConstellation from './TechConstellation';

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

interface MilestoneCardProps {
  entry: TimelineEntry;
  isRight: boolean;
  isActive: boolean;
  delay: number;
  dotRef: (el: HTMLDivElement | null) => void;
}

const MilestoneCard = ({
  entry,
  isRight,
  isActive,
  delay,
  dotRef,
}: MilestoneCardProps) => {
  const { label, description } = getMeta(entry);

  return (
    <FadeIn
      delay={delay}
      className="relative mb-12 flex items-center justify-between last:mb-0 md:mb-24"
    >
      {!isRight && <div className="hidden w-5/12 md:block" />}

      <div
        ref={dotRef}
        className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-neon md:block"
      />

      <div
        style={{ '--pulse-x': isRight ? '6px' : '-6px' } as React.CSSProperties}
        className={`glass-card w-full p-8 md:w-5/12 ${isRight ? 'md:text-right' : ''} ${
          isActive ? 'milestone-card--active' : ''
        }`}
      >
        <span className="mb-2 block font-display text-2xl text-primary">
          {entry.displayDate}
        </span>
        <h3 className="mb-3 text-xl font-bold">
          {entry.type === 'post' ? (
            <Link href={entry.url} className="hover:text-primary">
              {entry.title}
            </Link>
          ) : (
            entry.title
          )}
        </h3>
        {(label || description) && (
          <p className="text-on-surface-variant">
            {label && (
              <span className="font-semibold text-on-surface">{label}</span>
            )}
            {label && description && ' — '}
            {description}
          </p>
        )}
      </div>

      {isRight && <div className="hidden w-5/12 md:block" />}
    </FadeIn>
  );
};

const MilestonesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Raw target tracks the viewport's center 1:1 with scroll; the spring
  // lags gently behind it so the rocket reads as travelling the timeline
  // instead of teleporting from dot to dot.
  const rocketTop = useMotionValue(0);
  const smoothRocketTop = useSpring(rocketTop, {
    stiffness: 45,
    damping: 20,
    mass: 0.9,
  });

  useEffect(() => {
    let rafId = 0;

    const updateActive = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const viewportCenter = window.innerHeight / 2;
      rocketTop.set(viewportCenter - containerRect.top);

      let closestIndex = 0;
      let closestDistance = Infinity;

      dotRefs.current.forEach((dot, index) => {
        if (!dot) return;
        const rect = dot.getBoundingClientRect();
        const dotCenter = rect.top + rect.height / 2;
        const distance = Math.abs(dotCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rocketTop]);

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

      <div ref={containerRef} className="relative mx-auto max-w-4xl">
        <TechConstellation />

        <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />

        <motion.div
          aria-hidden="true"
          className="scroll-rocket hidden md:block"
          style={{ top: smoothRocketTop }}
        >
          <Flame className="scroll-rocket-flame" size={20} />
          <Rocket className="scroll-rocket-icon" size={30} />
        </motion.div>

        {TIMELINE.map((entry, index) => (
          <MilestoneCard
            key={`${entry.type}-${entry.sortKey}-${entry.title}`}
            entry={entry}
            isRight={index % 2 === 1}
            isActive={index === activeIndex}
            delay={Math.min(index, 8) * 0.1}
            dotRef={(el) => {
              dotRefs.current[index] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default MilestonesSection;
