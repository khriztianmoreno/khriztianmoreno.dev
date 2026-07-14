import Magnet from '../../common/Magnet';

const FACE_IMAGE =
  'https://res.cloudinary.com/khriztianmoreno/image/upload/q_auto,f_auto,w_90/v1604105684/KM-brand/profile%20imgs/CARA_KHRIZTIAN_final-01.png';

function Hero() {
  return (
    <section
      id="banner_section"
      className="hero-gradient relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-32 pb-20"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-300 grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="mb-4 block font-mono text-sm uppercase tracking-[0.3em] text-primary">
            Full Stack AI Engineer &amp; Technical Evangelist
          </span>

          <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Khriztian Moreno{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              builds with AI &amp; the modern web
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg font-light text-on-surface-variant opacity-90 lg:mx-0">
            Google Developer Expert, international speaker, and community
            leader who loves to teach — 15+ years designing scalable web
            architectures across Latin America and beyond.
          </p>

          <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
            <Magnet>
              <a
                href="#awards_section"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-on-primary transition-all hover:shadow-neon"
              >
                Explore The Journey
              </a>
            </Magnet>
            <Magnet>
              <a
                href="https://www.linkedin.com/in/khriztianmoreno/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-primary"
              >
                Let&apos;s Talk
              </a>
            </Magnet>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative h-72 w-72 md:h-96 md:w-96">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -inset-4 animate-[spin_20s_linear_infinite] rounded-full border border-primary/20" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white/10 shadow-2xl">
              <img
                src={FACE_IMAGE}
                alt="Khriztian Moreno"
                className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
