'use client';

import { motion } from 'framer-motion';
import { Plane, Compass, Ticket } from 'lucide-react';

import Container from '../../common/UI/Container';
import { TIMELINE, type TimelineEntry } from '@/data/timeline';

const ICONS = {
  talk: Plane,
  workshop: Compass,
  post: Ticket,
} as const;

const stampVariants = {
  initial: { opacity: 0, scale: 0.85, rotate: -4 },
  whileInView: { opacity: 1, scale: 1, rotate: 0 },
};

const TimelineEntryDetails = ({ entry }: { entry: TimelineEntry }) => {
  if (entry.type === 'talk') {
    return (
      <>
        <p className="m-0 text-sm font-semibold leading-snug text-on-surface">
          {entry.event}
        </p>
        <p className="m-0 text-xs leading-snug text-on-surface-variant">
          {entry.location}
        </p>
        <p className="m-0 text-xs leading-snug text-outline">
          {entry.format}
          {entry.attendance ? ` · ${entry.attendance.toLocaleString()} attendees` : ''}
        </p>
      </>
    );
  }

  if (entry.type === 'workshop') {
    return (
      <>
        <p className="m-0 text-sm font-semibold leading-snug text-on-surface">
          {entry.org}
        </p>
        <p className="m-0 text-xs leading-normal text-on-surface-variant">
          {entry.description}
        </p>
        <p className="m-0 text-xs leading-snug text-outline">
          {entry.format}
          {entry.attendance ? ` · ${entry.attendance.toLocaleString()} attendees` : ''}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="m-0 text-xs font-semibold leading-snug uppercase tracking-wide text-outline">
        {entry.theme}
      </p>
      <p className="m-0 text-xs leading-normal text-on-surface-variant">
        {entry.description}
      </p>
    </>
  );
};

const TimelineSection = () => (
  <section
    id="timeline_section"
    className="timeline-section relative py-38"
  >
    <Container noGutter mobileGutter fullWidth>
      <div className="timeline-header w-full mb-22">
        <h2 className="mb-5 text-3xl font-semibold leading-snug text-on-surface">
          Talks, Workshops &amp; Writing
        </h2>
        <p className="m-0 text-base font-normal leading-normal text-on-surface-variant">
          A passport of international conferences, hands-on workshops, and technical
          articles shared across the JavaScript and AI web ecosystem.
        </p>
      </div>

      <div className="timeline-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TIMELINE.map((entry, index) => {
          const Icon = ICONS[entry.type];

          return (
            <motion.div
              key={`timeline-item-${index}`}
              className="timeline-stamp glass-card p-6"
              initial={stampVariants.initial}
              whileInView={stampVariants.whileInView}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={22} className="text-primary" />
                <span
                  className={`timeline-date text-xs uppercase tracking-widest ${
                    entry.undated ? 'text-outline/60' : 'text-outline'
                  }`}
                >
                  {entry.displayDate}
                </span>
              </div>

              <h3 className="m-0 mb-2 text-base font-semibold leading-snug text-on-surface">
                {entry.type === 'post' ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface hover:text-primary"
                  >
                    {entry.title}
                  </a>
                ) : (
                  entry.title
                )}
              </h3>

              <TimelineEntryDetails entry={entry} />
            </motion.div>
          );
        })}
      </div>
    </Container>

    <style>{`
      .timeline-header { max-width: 50%; }
      .timeline-stamp {
        position: relative;
      }
      .timeline-stamp:nth-child(3n + 1) { transform: rotate(-1deg); }
      .timeline-stamp:nth-child(3n + 2) { transform: rotate(0.5deg); }
      .timeline-stamp:nth-child(3n) { transform: rotate(-0.5deg); }
      .timeline-date {
        font-family: var(--font-mono);
        letter-spacing: 0.12em;
      }
      @media (max-width: 1200px) { .timeline-section { padding: 110px 0; } }
      @media (max-width: 990px)  { .timeline-section { padding: 100px 0; } }
      @media (max-width: 767px)  {
        .timeline-section { padding: 80px 0; }
        .timeline-header { max-width: 100%; margin-bottom: 30px; }
        .timeline-stamp { transform: none !important; }
      }
      @media (max-width: 575px)  { .timeline-section { padding: 60px 0; } }
    `}</style>
  </section>
);

export default TimelineSection;
