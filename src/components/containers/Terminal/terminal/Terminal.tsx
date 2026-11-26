'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

import type { CommandOutput, HistoryItem, ThemeName } from '../types';
import { THEMES } from '../lib/themes';
import { CMD_NAMES, COMMANDS } from '../data/commands';
import { ALIASES } from '../data/aliases';
import { BLOG_POSTS } from '../data/blog-posts';
import { FS } from '../data/filesystem';
import { SUGGESTED } from '../data/suggested';

import { Banner } from './Banner';
import { Chip } from './Chip';
import { CommandPalette } from './CommandPalette';
import { IconBtn } from './IconBtn';
import { OutputBlock } from './OutputBlock';
import { Prompt } from './Prompt';
import styles from './Terminal.module.css';

// Auto-complete domain — registered commands + filesystem verbs.
const COMPLETION_POOL = [...CMD_NAMES, 'ls', 'cd', 'cat'];

// ═══════════════════════════════════════════════════════════════
// Native port of the khriztianmoreno.com Warp-style terminal, embedded as a
// section of the home page. Unix-like: ls / cd / cat / top / history / uname
// / alias / curl.
//
// Embedding rules (the reason this is not an iframe anymore):
// - Only the output container scrolls (scrollTop), never the document —
//   no `scrollIntoView`.
// - No autofocus on mount; the input is focused on click with
//   `preventScroll` so the page never jumps.
// - Keyboard shortcuts (⌘K / Esc) are handled on the terminal element, so
//   they only fire while focus is inside the terminal.
// - The palette and status bar are positioned inside the window instead of
//   `position: fixed` over the whole page.
// ═══════════════════════════════════════════════════════════════
export function Terminal() {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const toggleTheme = () =>
    setThemeName((t) => (t === 'dark' ? 'light' : 'dark'));

  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 0, kind: 'banner' },
  ]);
  const [input, setInput] = useState('');
  const [cmdLog, setCmdLog] = useState<string[]>([]);
  const [logIdx, setLogIdx] = useState(-1);
  // "" = root, or "blog"/etc inside the virtual filesystem.
  const [cwd, setCwd] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);

  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // First matching completion candidate for the current input.
  const ghost =
    input &&
    COMPLETION_POOL.find(
      (c) => c.startsWith(input.toLowerCase()) && c !== input.toLowerCase(),
    );

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  // Keep the session pinned to its latest output. This scrolls the terminal's
  // own container only — the host page never moves.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [history]);

  // Runs the command pointed to by a virtual file (e.g. README.md -> whoami).
  const runVirtual = (key: string, push: (out: CommandOutput) => void) => {
    if (key === '__blog') {
      push({ type: 'filelist', files: BLOG_POSTS, hint: 'cat <file> to read' });
      return;
    }
    const found = COMMANDS[key];
    if (found) {
      const out = found.run();
      if (out.type !== 'clear' && out.type !== 'theme') push(out);
    }
  };

  // The brain: parse + execute a line of input.
  const exec = (raw: string) => {
    const line = raw.trim();
    if (!line) return;
    setCmdLog((l) => [...l, line]);
    setLogIdx(-1);

    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(' ');
    const lc = cmd.toLowerCase();
    const push = (out: CommandOutput) => {
      const id = idRef.current++;
      setHistory((h) => [...h, { id, kind: 'cmd', cmd: line, out }]);
    };

    // Resolve user-defined aliases (bio -> whoami, etc.).
    const aliasHit = ALIASES.find((a) => a.from === lc);
    const real = aliasHit ? aliasHit.to : lc;

    // ── filesystem: ls ──
    if (real === 'ls') {
      if (cwd === 'blog' || arg.replace(/\/$/, '') === 'blog') {
        push({
          type: 'filelist',
          files: BLOG_POSTS,
          hint: 'cat <file> to read · cd .. to go back',
        });
        return;
      }
      push({ type: 'ls' });
      return;
    }

    // ── filesystem: cd ──
    if (real === 'cd') {
      const dest = arg.replace(/\/$/, '');
      if (!dest || dest === '~' || dest === '/') {
        setCwd('');
        push({ type: 'muted', text: '→ ~/portfolio' });
        return;
      }
      if (dest === '..') {
        setCwd('');
        push({ type: 'muted', text: '→ ~/portfolio' });
        return;
      }
      if (FS[`${dest}/`] && FS[`${dest}/`].kind === 'dir') {
        setCwd(dest);
        push({ type: 'muted', text: `→ ~/portfolio/${dest}` });
        return;
      }
      push({
        type: 'error',
        cmd: `cd: ${dest}`,
        suggest: null,
        msg: 'no such directory',
      });
      return;
    }

    // ── filesystem: cat ──
    if (real === 'cat') {
      const f = arg.replace(/^\.\//, '');
      if (FS[f] && FS[f].kind === 'file') {
        runVirtual(FS[f].run, push);
        return;
      }
      if (cwd === 'blog' && BLOG_POSTS.includes(f)) {
        push({
          type: 'muted',
          text: `// ${f} — full article lives on /blog (run \`blog\`)`,
        });
        return;
      }
      push({
        type: 'error',
        cmd: `cat: ${f || '?'}`,
        suggest: null,
        msg: 'no such file',
      });
      return;
    }

    // ── unix info commands ──
    if (real === 'uname') {
      push({ type: 'uname', full: arg.includes('-a') });
      return;
    }
    if (real === 'history') {
      push({ type: 'history', session: cmdLog });
      return;
    }
    if (real === 'pwd') {
      push({
        type: 'muted',
        text: `/home/khriztianmoreno/portfolio${cwd ? `/${cwd}` : ''}`,
      });
      return;
    }
    if (real === 'echo') {
      push({ type: 'muted', text: arg || '' });
      return;
    }
    if (real === 'curl') {
      push({ type: 'curl', url: arg || 'https://medellinjs.org' });
      return;
    }
    if (real === 'date') {
      push({ type: 'muted', text: new Date().toString() });
      return;
    }

    // ── easter eggs ──
    if (real === 'sudo') {
      push({
        type: 'joke',
        text: "Permission denied. Nice try — but you don't have root access to my life. 🔒",
      });
      return;
    }
    if (
      (real === 'rm' && arg.includes('-rf')) ||
      line.toLowerCase().includes('rm -rf /')
    ) {
      push({
        type: 'joke',
        text: 'Error: core memory protected. Medellin.js and the Ducati files cannot be deleted. 🛡️',
      });
      return;
    }
    if (real === 'rm') {
      push({
        type: 'joke',
        text: "rm: I don't delete things here. I only ship them. 🚀",
      });
      return;
    }
    if (real === 'mkdir') {
      push({
        type: 'joke',
        text: "mkdir: directory 'side_project' created… and immediately abandoned. We've all been there. 😅",
      });
      return;
    }
    if (real === 'exit' || real === 'logout') {
      push({
        type: 'joke',
        text: 'There is no exit. Only `git push`. Stay a while. 👋',
      });
      return;
    }
    if (real === 'vim' || real === 'nvim' || real === 'emacs') {
      push({
        type: 'joke',
        text: `${real}: opened. Now good luck closing it. (try \`:q\`… kidding) ⌨️`,
      });
      return;
    }
    if (real === 'whoareyou') {
      push(COMMANDS.whoami.run());
      return;
    }
    if (real === 'ping') {
      push({
        type: 'muted',
        text: 'PONG — 8ms from Medellín 🇨🇴. Always online.',
      });
      return;
    }
    if (real === 'man') {
      push({
        type: 'muted',
        text: `No manual entry for "${arg}". Run \`help\` — it's friendlier anyway.`,
      });
      return;
    }

    // ── registered commands ──
    const found = COMMANDS[real];
    if (found) {
      const out = found.run();
      if (out.type === 'clear') {
        setHistory([]);
        return;
      }
      if (out.type === 'theme') toggleTheme();
      push(out);
      return;
    }

    // ── fallback ──
    const suggest = CMD_NAMES.find((c) => c.startsWith(lc[0])) ?? null;
    push({ type: 'error', cmd: line, suggest, msg: 'command not found' });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      exec(input);
      setInput('');
    } else if (e.key === 'Tab') {
      // Only trap Tab when there is something to complete, so keyboard users
      // can still tab out of the terminal.
      if (ghost) {
        e.preventDefault();
        setInput(ghost);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdLog.length) return;
      const ni = logIdx < 0 ? cmdLog.length - 1 : Math.max(0, logIdx - 1);
      setLogIdx(ni);
      setInput(cmdLog[ni]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (logIdx < 0) return;
      const ni = logIdx + 1;
      if (ni >= cmdLog.length) {
        setLogIdx(-1);
        setInput('');
      } else {
        setLogIdx(ni);
        setInput(cmdLog[ni]);
      }
    }
  };

  // ⌘K / Ctrl+K toggles the palette, Esc closes it. Scoped to the terminal
  // element (not `window`) so the rest of the page keeps its shortcuts.
  const onTerminalKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (paletteOpen) closePalette();
      else setPaletteOpen(true);
    } else if (e.key === 'Escape' && paletteOpen) {
      e.preventDefault();
      closePalette();
    }
  };

  const closePalette = () => {
    setPaletteOpen(false);
    focusInput();
  };

  // Clicking anywhere in the session focuses the prompt, unless the user is
  // selecting text to copy.
  const onSessionClick = (e: MouseEvent<HTMLDivElement>) => {
    if (window.getSelection()?.toString()) return;
    if ((e.target as HTMLElement).closest('a')) return;
    focusInput();
  };

  const runAndRefocus = (c: string) => {
    exec(c);
    focusInput();
  };

  const pathLabel = cwd ? `~/portfolio/${cwd}` : '~/portfolio';

  return (
    <div
      onKeyDown={onTerminalKey}
      className="relative overflow-hidden rounded-xl border border-primary/30 bg-black font-mono shadow-neon"
    >
      {/* ── WINDOW CHROME ── */}
      <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-3">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
        <span className="ml-3 hidden text-xs text-on-surface-variant sm:inline">
          khriztianmoreno.com
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/20 px-2.5 py-1 text-xs text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <span>⌕</span>
            <span className="hidden md:inline">Search commands…</span>
            <span className="rounded border border-primary/20 px-1.5 text-[11px]">
              ⌘K
            </span>
          </button>
          <IconBtn title="Toggle terminal theme" onClick={toggleTheme}>
            {themeName === 'dark' ? '☾' : '☀'}
          </IconBtn>
          <IconBtn title="Home (whoami)" onClick={() => runAndRefocus('whoami')}>
            ⌂
          </IconBtn>
        </div>
      </div>

      {/* ── THEMED BODY ── */}
      <div
        style={THEMES[themeName]}
        className="bg-(--t-panel) text-(--t-text) transition-colors duration-300 selection:bg-(--t-accent)/25"
      >
        {/* ── SESSION (the only scrolling element) ── */}
        <div
          ref={scrollRef}
          onClick={onSessionClick}
          className="h-[440px] overflow-y-auto px-[18px] pb-6 pt-5 text-sm leading-[1.6] [scrollbar-width:thin] md:h-[500px]"
        >
          {history.map((h) => (
            <div key={h.id} className={`${styles.fadeUp} mb-4`}>
              {h.kind === 'banner' ? (
                <Banner />
              ) : (
                <>
                  <div className="flex gap-2">
                    <Prompt path={pathLabel} />
                    <span className="break-all text-(--t-bright)">{h.cmd}</span>
                  </div>
                  <div className="mt-1.5 pl-0.5">
                    <OutputBlock out={h.out} onPick={runAndRefocus} />
                  </div>
                </>
              )}
            </div>
          ))}

          {/* two-line prompt */}
          <div className="mt-1">
            <div className="mb-1.5 flex flex-wrap gap-2">
              <Chip icon="⬢" text="node v22.22.3" colorClass="text-(--t-green)" />
              <Chip icon="▸" text={pathLabel} colorClass="text-(--t-accent)" />
              <Chip icon="⎇" text="main" colorClass="text-(--t-green)" />
              <Chip
                icon="±"
                text={`${cmdLog.length}`}
                colorClass="text-(--t-dim)"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base text-(--t-accent)">❯</span>
              <div className="relative flex-1">
                <span className="whitespace-pre text-(--t-bright)">{input}</span>
                {ghost && (
                  <span className="text-(--t-dim)">
                    {ghost.slice(input.length)}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={`${styles.cursor} ml-px inline-block h-4 w-2 bg-(--t-accent) align-text-bottom shadow-[0_0_8px_var(--t-accent)]`}
                />
                {/* Invisible real input. 16px font avoids iOS zoom-on-focus. */}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  aria-label="Terminal command input"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="absolute inset-0 w-full border-none bg-transparent text-base opacity-0 outline-none"
                />
              </div>
            </div>
          </div>

          {ghost && (
            <div className="mt-1.5 pl-0.5 text-[11px] text-(--t-dim)">
              press <span className="text-(--t-green)">Tab</span> to complete →{' '}
              <span className="text-(--t-accent)">{ghost}</span>
            </div>
          )}
        </div>

        {/* ── SUGGESTED CHIPS ── */}
        <div className="flex flex-wrap gap-2 border-t border-(--t-border) px-[18px] py-3">
          <span className="self-center text-xs text-(--t-dim)">suggested:</span>
          {SUGGESTED.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => runAndRefocus(c)}
              className="cursor-pointer rounded-[7px] border border-(--t-chip-border) bg-(--t-chip) px-3 py-1 text-[12.5px] text-(--t-accent) transition-colors hover:border-(--t-accent)"
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── STATUS BAR ── */}
        <div className="flex flex-wrap items-center gap-2 border-t border-(--t-border) px-4 py-[7px] text-[11.5px]">
          <Chip icon="⬢" text="v22.22.3" colorClass="text-(--t-green)" />
          <Chip icon="▸" text={pathLabel} colorClass="text-(--t-accent)" />
          <Chip icon="⎇" text="main" colorClass="text-(--t-green)" />
          <span className="flex-1" />
          <span className="text-(--t-dim)">15y exp</span>
          <span className="text-(--t-track)">·</span>
          <span className="text-(--t-amber)">4 awards</span>
          <span className="text-(--t-track)">·</span>
          <span className="text-(--t-dim)">
            {cmdLog.length} cmd{cmdLog.length === 1 ? '' : 's'} run
          </span>
        </div>

        {paletteOpen && (
          <CommandPalette
            onClose={closePalette}
            onRun={(c) => {
              closePalette();
              exec(c);
            }}
          />
        )}
      </div>
    </div>
  );
}
