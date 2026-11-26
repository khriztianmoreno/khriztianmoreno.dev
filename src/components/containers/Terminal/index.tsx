import FadeIn from '../../common/FadeIn';

const TERMINAL_URL = 'https://www.khriztianmoreno.com/';

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
          href={TERMINAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden font-mono text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary md:inline"
        >
          Open full screen ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/30 bg-black shadow-neon">
        <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-3">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-yellow-500/80" />
          <span className="size-3 rounded-full bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-on-surface-variant">
            khriztianmoreno.com
          </span>
        </div>
        <iframe
          src={TERMINAL_URL}
          title="Interactive terminal portfolio"
          loading="lazy"
          className="block h-[640px] w-full"
        />
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        Click inside and type <span className="text-primary">help</span> to start
      </p>
    </FadeIn>
  </section>
);

export default TerminalSection;
