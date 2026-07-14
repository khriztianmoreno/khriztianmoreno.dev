import FadeIn from '../../common/FadeIn';

interface StackCategory {
  label: string;
  items: string[];
}

const STACK: StackCategory[] = [
  {
    label: 'Frontend',
    items: [
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Vue.js / Nuxt.js',
      'Tailwind CSS',
    ],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Express', 'GraphQL', 'Apollo Client'],
  },
  {
    label: 'Data & Persistence',
    items: ['Sequelize', 'Mongoose', 'MongoDB', 'PostgreSQL'],
  },
  {
    label: 'Mobile',
    items: ['React Native', 'Expo'],
  },
  {
    label: 'Cloud & Infrastructure',
    items: ['AWS', 'Google Cloud', 'Serverless', 'Firebase'],
  },
  {
    label: 'Emerging & Tooling',
    items: ['Rust (Rspack)', 'WebAssembly', 'Model Context Protocol (MCP)'],
  },
];

const StackSection = () => (
  <section
    id="stack_section"
    className="starlit-bg relative flex flex-col items-center justify-center overflow-hidden px-6 py-30"
  >
    <FadeIn className="relative z-10 mb-16 max-w-2xl text-center">
      <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
        Technical Ecosystem
      </span>
      <h2 className="mb-8 font-display text-4xl md:text-6xl">
        Forged in the Stack
      </h2>
      <p className="rounded-xl border border-primary/20 bg-background/60 p-6 text-lg text-on-surface-variant shadow-neon backdrop-blur-md">
        15+ years shipping production systems across frontend, backend,
        mobile, and cloud — with a growing focus on AI-assisted development
        workflows.
      </p>
    </FadeIn>

    <div className="relative z-10 grid w-full max-w-300 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {STACK.map((category, index) => (
        <FadeIn
          key={category.label}
          delay={index * 0.1}
          className="glass-card p-6"
        >
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
            {category.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.items.map((item) => (
              <span
                key={item}
                className="rounded-sm border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-xs text-secondary"
              >
                {item}
              </span>
            ))}
          </div>
        </FadeIn>
      ))}
    </div>
  </section>
);

export default StackSection;
