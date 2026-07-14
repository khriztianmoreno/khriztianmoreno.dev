import FadeIn from '../../common/FadeIn';
import { MILESTONES } from '@/data/milestones';

const MilestonesSection = () => (
  <section
    id="milestones_section"
    className="relative overflow-hidden bg-surface px-6 py-30"
  >
    <div className="mx-auto mb-24 max-w-300 text-center">
      <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
        Chronicles
      </span>
      <h2 className="font-display text-4xl md:text-6xl">Milestones</h2>
    </div>

    <div className="relative mx-auto max-w-4xl">
      <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />

      {MILESTONES.map((milestone, index) => {
        const isRight = index % 2 === 1;

        return (
          <FadeIn
            key={`${milestone.year}-${milestone.title}`}
            delay={index * 0.1}
            className="relative mb-12 flex items-center justify-between last:mb-0 md:mb-24"
          >
            {!isRight && <div className="hidden w-5/12 md:block" />}

            <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-neon md:block" />

            <div
              className={`glass-card w-full p-8 md:w-5/12 ${
                isRight ? 'md:text-right' : ''
              }`}
            >
              <span className="mb-2 block font-display text-4xl text-primary">
                {milestone.year}
              </span>
              <h3 className="mb-3 text-xl font-bold">{milestone.title}</h3>
              <p className="text-on-surface-variant">
                <span className="font-semibold text-on-surface">
                  {milestone.org}
                </span>{' '}
                — {milestone.description}
              </p>
            </div>

            {isRight && <div className="hidden w-5/12 md:block" />}
          </FadeIn>
        );
      })}
    </div>
  </section>
);

export default MilestonesSection;
