import type { Project } from '../types';

// EDIT ME: live projects shown by `top`.
export const PROJECTS: Project[] = [
  {
    pid: 101,
    name: 'MedellinJS_Migr',
    cpu: 45.5,
    mem: '16G',
    state: 'RUNNING',
    note: 'Aug 2026 DL',
  },
  {
    pid: 102,
    name: 'Honest_Daily',
    cpu: 35.0,
    mem: '32G',
    state: 'RUNNING',
    note: 'content engine',
  },
  {
    pid: 103,
    name: 'BuildWithAI_Talk',
    cpu: 15.0,
    mem: '8G',
    state: 'SLEEPING',
    note: 'ready May 29',
  },
  {
    pid: 104,
    name: 'Ducati_Repair',
    cpu: 4.5,
    mem: '2G',
    state: 'WAITING',
    note: 'for insurance',
  },
];
