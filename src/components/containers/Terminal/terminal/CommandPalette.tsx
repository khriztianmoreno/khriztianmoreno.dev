'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CMD_NAMES, COMMANDS } from '../data/commands';
import styles from './Terminal.module.css';

interface CommandPaletteProps {
  onClose: () => void;
  onRun: (cmd: string) => void;
}

// Spotlight-like overlay (⌘K) that fuzzy-filters the command catalog.
// Unlike the full-screen original, it is positioned inside the terminal
// window (absolute, not fixed) so it never covers or scrolls the host page.
export function CommandPalette({ onClose, onRun }: CommandPaletteProps) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = q.toLowerCase();
  const results = CMD_NAMES.filter(
    (c) => c.includes(query) || COMMANDS[c].desc.toLowerCase().includes(query),
  );

  // Replaces `autoFocus`: focus without letting the browser scroll the page.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      if (results[sel]) onRun(results[sel]);
    }
  };

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12%] backdrop-blur-[3px]"
    >
      <div
        role="dialog"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className={`${styles.pop} w-full max-w-[560px] overflow-hidden rounded-xl border border-(--t-border) bg-(--t-panel) shadow-[0_24px_64px_rgba(0,0,0,.5)]`}
      >
        <div className="flex items-center gap-2.5 border-b border-(--t-border) px-3.5 py-3">
          <span className="text-(--t-dim)">⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder="Run a command…"
            aria-label="Search commands"
            spellCheck={false}
            className="flex-1 border-none bg-transparent font-mono text-base text-(--t-bright) outline-none placeholder:text-(--t-dim) md:text-sm"
          />
          <span className="rounded border border-(--t-chip-border) px-1.5 py-px text-[11px] text-(--t-dim)">
            esc
          </span>
        </div>
        <div className="max-h-[320px] overflow-y-auto overscroll-contain p-1.5">
          {results.length === 0 && (
            <div className="px-2.5 py-3 text-[13px] text-(--t-red)">
              no command matches &quot;{q}&quot;
            </div>
          )}
          {results.map((c, i) => (
            <button
              type="button"
              key={c}
              onMouseEnter={() => setSel(i)}
              onClick={() => onRun(c)}
              className={`flex w-full cursor-pointer items-baseline gap-3 rounded-[7px] px-2.5 py-2 text-left ${
                i === sel ? 'bg-(--t-hover)' : 'bg-transparent'
              }`}
            >
              <span className="min-w-[104px] text-[13px] text-(--t-green)">
                {c}
              </span>
              <span className="text-[12.5px] text-(--t-dim)">
                {COMMANDS[c].desc}
              </span>
              {i === sel && (
                <span className="ml-auto text-[11px] text-(--t-dim)">↵</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
