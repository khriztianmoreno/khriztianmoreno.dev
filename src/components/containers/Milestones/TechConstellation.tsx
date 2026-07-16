import {
  Atom,
  Binary,
  Bot,
  Boxes,
  Braces,
  Cloud,
  Code2,
  Component,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Network,
  Puzzle,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

interface Star {
  Icon: LucideIcon;
  color: string;
  top: number;
  left: number;
  size: number;
  glow: number;
  minOpacity: number;
  maxOpacity: number;
  duration: number;
  delay: number;
}

const NEON = {
  teal: '#00F59B',
  purple: '#A78BFA',
  orange: '#FF8A3D',
  cyan: '#38DDFF',
};

// Sizes range from faint, distant "stars" to bright, close "planets" —
// glow and opacity scale roughly with size so the big ones read as the
// nearby, brightest points in the field. Several sit close together in
// small clusters (constellations) instead of being spread evenly.
const STARS: Star[] = [
  // upper-left cluster
  { Icon: Code2, color: NEON.teal, top: 4, left: 4, size: 34, glow: 12, minOpacity: 0.28, maxOpacity: 0.6, duration: 9, delay: 0 },
  { Icon: Binary, color: NEON.cyan, top: 8, left: 9, size: 14, glow: 3, minOpacity: 0.12, maxOpacity: 0.28, duration: 6, delay: 1.1 },
  { Icon: Terminal, color: NEON.purple, top: 12, left: 3, size: 22, glow: 7, minOpacity: 0.2, maxOpacity: 0.42, duration: 8, delay: 2.3 },

  // upper-right cluster
  { Icon: Atom, color: NEON.cyan, top: 9, left: 92, size: 40, glow: 16, minOpacity: 0.3, maxOpacity: 0.68, duration: 11, delay: 0.5 },
  { Icon: Sparkles, color: NEON.orange, top: 15, left: 96, size: 13, glow: 3, minOpacity: 0.1, maxOpacity: 0.26, duration: 5.5, delay: 1.8 },

  { Icon: GitBranch, color: NEON.orange, top: 21, left: 6, size: 20, glow: 6, minOpacity: 0.18, maxOpacity: 0.4, duration: 8.5, delay: 0.8 },

  // mid-right cluster
  { Icon: Database, color: NEON.teal, top: 33, left: 90, size: 18, glow: 5, minOpacity: 0.16, maxOpacity: 0.36, duration: 7.5, delay: 1.4 },
  { Icon: Boxes, color: NEON.purple, top: 36, left: 95, size: 28, glow: 9, minOpacity: 0.24, maxOpacity: 0.5, duration: 10, delay: 2.6 },
  { Icon: Cpu, color: NEON.cyan, top: 40, left: 89, size: 14, glow: 3, minOpacity: 0.12, maxOpacity: 0.28, duration: 6.5, delay: 0.2 },

  { Icon: Braces, color: NEON.teal, top: 47, left: 4, size: 32, glow: 11, minOpacity: 0.26, maxOpacity: 0.58, duration: 9.5, delay: 1.6 },

  { Icon: Component, color: NEON.purple, top: 54, left: 96, size: 16, glow: 4, minOpacity: 0.14, maxOpacity: 0.3, duration: 7, delay: 2.9 },

  // lower-left cluster
  { Icon: Layers, color: NEON.orange, top: 62, left: 3, size: 24, glow: 8, minOpacity: 0.2, maxOpacity: 0.44, duration: 8, delay: 0.4 },
  { Icon: Network, color: NEON.cyan, top: 66, left: 8, size: 38, glow: 15, minOpacity: 0.3, maxOpacity: 0.65, duration: 11.5, delay: 1.2 },

  { Icon: Puzzle, color: NEON.purple, top: 71, left: 93, size: 20, glow: 6, minOpacity: 0.18, maxOpacity: 0.4, duration: 8.5, delay: 2.1 },

  // lower-right cluster
  { Icon: Cloud, color: NEON.teal, top: 79, left: 90, size: 14, glow: 3, minOpacity: 0.12, maxOpacity: 0.28, duration: 6, delay: 0.6 },
  { Icon: Bot, color: NEON.orange, top: 82, left: 95, size: 26, glow: 9, minOpacity: 0.24, maxOpacity: 0.5, duration: 9.5, delay: 1.9 },
  { Icon: Atom, color: NEON.cyan, top: 85, left: 88, size: 18, glow: 5, minOpacity: 0.16, maxOpacity: 0.36, duration: 7.5, delay: 2.7 },

  { Icon: Sparkles, color: NEON.purple, top: 90, left: 5, size: 30, glow: 10, minOpacity: 0.26, maxOpacity: 0.55, duration: 10, delay: 0.9 },
  { Icon: Binary, color: NEON.teal, top: 95, left: 92, size: 15, glow: 4, minOpacity: 0.13, maxOpacity: 0.3, duration: 6.5, delay: 1.5 },
];

const TechConstellation = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 hidden md:block"
  >
    {STARS.map((star, index) => (
      <span
        key={index}
        className="constellation-star"
        style={
          {
            top: `${star.top}%`,
            left: `${star.left}%`,
            color: star.color,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            '--star-glow': `${star.glow}px`,
            '--star-min-opacity': star.minOpacity,
            '--star-max-opacity': star.maxOpacity,
          } as React.CSSProperties
        }
      >
        <star.Icon size={star.size} strokeWidth={1.5} />
      </span>
    ))}
  </div>
);

export default TechConstellation;
