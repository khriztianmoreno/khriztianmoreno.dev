import type { Skill } from '../types';

// Tech proficiency bars shown by `skills`.
// Render order is intentional: AI-era headliners come first to anchor the
// reader, foundational stack in the middle, and operational tooling at the
// end. A second AI cluster reinforces depth halfway down the list.
export const SKILLS: Skill[] = [
  // ── AI era — headline ────────────────────────────────────────
  { name: 'generative ai', pct: 82 },
  { name: 'prompt engineering', pct: 88 },
  { name: 'ai agents · mcp', pct: 80 },

  // ── Languages ────────────────────────────────────────────────
  { name: 'typescript', pct: 85 },
  { name: 'javascript', pct: 80 },

  // ── Frontend ─────────────────────────────────────────────────
  { name: 'next.js', pct: 88 },
  { name: 'react', pct: 80 },
  { name: 'react-native', pct: 85 },
  { name: 'vuejs', pct: 90 },
  { name: 'angular', pct: 80 },
  { name: 'html / css', pct: 98 },

  // ── AI era — depth ───────────────────────────────────────────
  { name: 'openai · anthropic', pct: 82 },
  { name: 'vercel ai sdk', pct: 78 },
  { name: 'rag · vector dbs', pct: 72 },

  // ── Backend ──────────────────────────────────────────────────
  { name: 'nodejs', pct: 80 },
  { name: 'nestjs', pct: 75 },
  { name: 'expressjs', pct: 70 },
  { name: 'graphql', pct: 75 },

  // ── Data ─────────────────────────────────────────────────────
  { name: 'mongodb', pct: 70 },
  { name: 'postgresql', pct: 70 },

  // ── Cloud & DevOps ───────────────────────────────────────────
  { name: 'aws', pct: 70 },
  { name: 'azure', pct: 65 },
  { name: 'docker', pct: 72 },

  // ── Methodology ──────────────────────────────────────────────
  { name: 'agile', pct: 100 },
];

// Daily-driver stack shown by `stack` command.
export const DAILY_STACK: string[] = [
  'TypeScript',
  'Next.js',
  'React',
  'React Native',
  'Node.js · NestJS',
  'GraphQL',
  'Generative AI · LLMs',
  'MCP · AI Agents',
  'Vercel AI SDK',
  'AWS · Azure',
];
