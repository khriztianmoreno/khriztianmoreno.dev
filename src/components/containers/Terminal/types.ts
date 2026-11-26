// Shared TypeScript types for the terminal-style portfolio.
// Ported from khriztianmoreno/khriztianmoreno.com (types/terminal.ts).

export type ThemeName = 'dark' | 'light';

export interface Project {
  pid: number;
  name: string;
  cpu: number;
  mem: string;
  state: 'RUNNING' | 'SLEEPING' | 'WAITING';
  note: string;
}

export interface Award {
  tag: string;
  org: string;
  since: string;
}

export interface ExperienceItem {
  co: string;
  role: string;
  when: string;
  note: string;
}

export interface Skill {
  name: string;
  pct: number;
}

export interface EducationItem {
  school: string;
  deg: string;
  when: string;
}

export interface Community {
  name: string;
  url: string;
  note: string;
}

export interface Social {
  key: string;
  url: string;
}

export interface Alias {
  from: string;
  to: string;
}

// Virtual filesystem entry: a dir or file mapped to a command key.
export interface FsEntry {
  kind: 'dir' | 'file';
  run: string;
}

// Color token allowed inside a "lines" output (matches keys exposed by OutputBlock).
export type LineColor = 'accent' | 'text' | 'dim' | 'green' | 'amber' | 'pink';

export interface OutputLine {
  t: string;
  c?: LineColor;
  bold?: boolean;
  link?: string;
}

// Discriminated union describing every possible output a command can produce.
export type CommandOutput =
  | { type: 'help' }
  | { type: 'lines'; lines: OutputLine[] }
  | { type: 'muted'; text: string }
  | { type: 'joke'; text: string }
  | { type: 'theme' }
  | { type: 'ls' }
  | { type: 'filelist'; files: string[]; hint?: string }
  | { type: 'top' }
  | { type: 'uname'; full: boolean }
  | { type: 'alias' }
  | { type: 'history'; session: string[] }
  | { type: 'curl'; url: string }
  | { type: 'stack'; items: string[] }
  | { type: 'experience' }
  | { type: 'skills' }
  | { type: 'awards' }
  | { type: 'education' }
  | { type: 'communities' }
  | { type: 'socials' }
  | { type: 'hire' }
  | { type: 'banner' }
  | { type: 'clear' }
  | { type: 'error'; cmd: string; suggest: string | null; msg: string };

export interface Command {
  desc: string;
  run: () => CommandOutput;
}

export type HistoryItem =
  | { id: number; kind: 'banner' }
  | { id: number; kind: 'cmd'; cmd: string; out: CommandOutput };
