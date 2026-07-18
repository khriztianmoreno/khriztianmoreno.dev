import Magnet from '../../common/Magnet';
import FadeIn from '../../common/FadeIn';

const ClosingCTA = () => (
  <section className="starlit-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

    <FadeIn className="relative z-10">
      <h2 className="mb-8 font-display text-5xl italic md:text-8xl">
        The journey continues&hellip;
      </h2>
      <p className="mb-12 text-xl text-on-surface-variant">
        Will you be part of the next chapter?
      </p>
      <div className="flex flex-col justify-center gap-6 md:flex-row">
        <Magnet>
          <a
            href="https://sessionize.com/khriztianmoreno/"
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="book-speaking-click"
            className="inline-block rounded-full bg-primary px-10 py-5 text-xl font-bold text-on-primary transition-transform hover:scale-105 hover:shadow-neon"
          >
            Book for Speaking
          </a>
        </Magnet>
        <Magnet>
          <a
            href="https://www.linkedin.com/in/khriztianmoreno/"
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="get-in-touch-click"
            className="inline-block rounded-full border border-primary/40 px-10 py-5 text-xl font-bold text-primary transition-colors hover:border-primary"
          >
            Get In Touch
          </a>
        </Magnet>
      </div>
    </FadeIn>
  </section>
);

export default ClosingCTA;
