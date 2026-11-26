import type { Command } from '../types';
import { BLOG_URL, CV_PDF } from '../lib/constants';
import { DAILY_STACK } from './skills';

// Opens an external URL in a new tab without giving it access to this page.
const openExternal = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Master registry of named commands shown in `help` and the command palette.
// Filesystem commands (ls/cd/cat) are handled separately inside the terminal
// so they remain discoverable but stay out of the public help listing.
export const COMMANDS: Record<string, Command> = {
  help: {
    desc: 'list every available command',
    run: () => ({ type: 'help' }),
  },

  whoami: {
    desc: 'the short story',
    run: () => ({
      type: 'lines',
      lines: [
        { t: 'khriztianmoreno', c: 'accent', bold: true },
        { t: 'AI Fullstack Engineer · Educator · Community Builder', c: 'text' },
        { t: 'Medellín, Colombia 🇨🇴 · 15+ years shipping for the web', c: 'dim' },
        { t: '' },
        {
          t: 'From UI Developer at Globant (2013) to Microsoft MVP &',
          c: 'text',
        },
        {
          t: 'Google Developer Expert. Co-organizes Medellin.js — the',
          c: 'text',
        },
        { t: 'biggest JavaScript user group in Colombia.', c: 'text' },
        { t: '' },
        {
          t: 'Turns ideas into code, then teaches others to do the same',
          c: 'text',
        },
        { t: 'through articles, videos and courses.', c: 'text' },
        { t: '' },
        { t: '// try: ls · experience · skills · awards · top · hire', c: 'dim' },
      ],
    }),
  },

  experience: {
    desc: 'career history — git log style',
    run: () => ({ type: 'experience' }),
  },
  cv: {
    desc: 'career history (alias of experience)',
    run: () => ({ type: 'experience' }),
  },
  skills: { desc: 'tech proficiency bars', run: () => ({ type: 'skills' }) },

  stack: {
    desc: 'current daily-driver stack',
    run: () => ({ type: 'stack', items: DAILY_STACK }),
  },

  awards: {
    desc: 'recognitions & expert titles',
    run: () => ({ type: 'awards' }),
  },
  education: {
    desc: 'degrees & institutions',
    run: () => ({ type: 'education' }),
  },
  communities: {
    desc: 'user groups & confs I help run',
    run: () => ({ type: 'communities' }),
  },
  socials: { desc: 'links to every profile', run: () => ({ type: 'socials' }) },

  blog: {
    desc: 'go to the blog',
    run: () => {
      window.location.assign(BLOG_URL);
      return {
        type: 'lines',
        lines: [{ t: '→ opening /blog …', c: 'green' }],
      };
    },
  },

  resume: {
    desc: 'download the CV (PDF)',
    run: () => {
      openExternal(CV_PDF);
      return {
        type: 'lines',
        lines: [{ t: '→ downloading CV_Cristian.pdf …', c: 'green' }],
      };
    },
  },

  hire: {
    desc: 'how to start a project together',
    run: () => ({ type: 'hire' }),
  },

  contact: {
    desc: 'ways to reach out',
    run: () => ({
      type: 'lines',
      lines: [
        { t: 'Best channel: LinkedIn DM or Twitter/X.', c: 'text' },
        {
          t: '→ linkedin.com/in/khriztianmoreno',
          c: 'accent',
          link: 'https://www.linkedin.com/in/khriztianmoreno/',
        },
        {
          t: '→ twitter.com/khriztianmoreno',
          c: 'accent',
          link: 'https://twitter.com/khriztianmoreno',
        },
      ],
    }),
  },

  top: { desc: "what's eating my CPU right now", run: () => ({ type: 'top' }) },
  ps: { desc: 'running processes (alias of top)', run: () => ({ type: 'top' }) },
  uname: {
    desc: 'system / stack info — try `uname -a`',
    run: () => ({ type: 'uname', full: false }),
  },
  alias: {
    desc: 'show friendly command shortcuts',
    run: () => ({ type: 'alias' }),
  },
  theme: { desc: 'toggle dark / light mode', run: () => ({ type: 'theme' }) },
  clear: { desc: 'clear the session', run: () => ({ type: 'clear' }) },
  banner: { desc: 'redraw the welcome banner', run: () => ({ type: 'banner' }) },
};

// Cached list of command names — used by help, palette and auto-complete.
export const CMD_NAMES: string[] = Object.keys(COMMANDS);
