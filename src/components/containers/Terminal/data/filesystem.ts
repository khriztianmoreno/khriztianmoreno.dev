import type { FsEntry } from '../types';

// Virtual filesystem — dirs and files map to a command key.
// The trailing slash on dirs is part of the lookup key.
export const FS: Record<string, FsEntry> = {
  'blog/': { kind: 'dir', run: '__blog' },
  'projects/': { kind: 'dir', run: 'top' },
  'talks/': { kind: 'dir', run: 'communities' },
  'socials/': { kind: 'dir', run: 'socials' },
  'skills/': { kind: 'dir', run: 'skills' },
  'README.md': { kind: 'file', run: 'whoami' },
  'experience.log': { kind: 'file', run: 'experience' },
  'awards.txt': { kind: 'file', run: 'awards' },
};
