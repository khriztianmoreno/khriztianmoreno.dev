import FadeIn from '../../common/FadeIn';
import { Terminal } from './terminal';
import { SITE_URL } from './lib/constants';

const TerminalSection = () => (
  <section id="terminal" className="relative px-6 py-24">
    <FadeIn className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Interactive
          </p>
          <h2 className="font-display text-4xl italic md:text-6xl">Try the terminal</h2>
        </div>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden font-mono text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary md:inline"
        >
          Open full screen ↗
        </a>
      </div>

      <Terminal />

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        Click inside and type <span className="text-primary">help</span> to start
      </p>
    </FadeIn>
  </section>
);

export default TerminalSection;
