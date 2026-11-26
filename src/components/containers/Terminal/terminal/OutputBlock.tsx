import type { CommandOutput, LineColor } from '../types';
import { FS } from '../data/filesystem';
import { PROJECTS } from '../data/projects';
import { EXPERIENCE } from '../data/experience';
import { SKILLS } from '../data/skills';
import { AWARDS } from '../data/awards';
import { EDUCATION } from '../data/education';
import { COMMUNITIES } from '../data/communities';
import { SOCIALS } from '../data/socials';
import { ALIASES } from '../data/aliases';
import { FAKE_HISTORY } from '../data/history';
import { CONTACT_EMAIL } from '../lib/constants';

import { Banner } from './Banner';
import { HelpBlock } from './HelpBlock';
import { SkillBar } from './SkillBar';

interface OutputBlockProps {
  out: CommandOutput;
  onPick: (cmd: string) => void;
}

// Color tokens accepted by `lines`-style outputs.
const LINE_COLOR: Record<LineColor, string> = {
  accent: 'text-(--t-accent)',
  text: 'text-(--t-text)',
  dim: 'text-(--t-dim)',
  green: 'text-(--t-green)',
  amber: 'text-(--t-amber)',
  pink: 'text-(--t-pink)',
};

// Every link in command output points off-site, so it always opens a new tab.
const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;

const linkClass = 'hover:underline';
const commentClass = 'text-xs text-(--t-dim)';

// Renders the full output of a single executed command.
// One discriminated switch keeps the renderer fully type-safe.
export function OutputBlock({ out, onPick }: OutputBlockProps) {
  if (out.type === 'help') return <HelpBlock onPick={onPick} />;

  if (out.type === 'lines') {
    return (
      <div>
        {out.lines.map((l, i) => {
          const col = l.c ? LINE_COLOR[l.c] : LINE_COLOR.text;
          return (
            <div key={i} className={`${col} ${l.bold ? 'font-bold' : ''}`}>
              {l.link ? (
                <a href={l.link} {...EXTERNAL} className={linkClass}>
                  {l.t || ' '}
                </a>
              ) : (
                l.t || ' '
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (out.type === 'muted') {
    return <div className="text-(--t-dim)">{out.text}</div>;
  }
  if (out.type === 'joke') {
    return <div className="text-(--t-amber)">{out.text}</div>;
  }
  if (out.type === 'theme') {
    return (
      <div className="text-(--t-green)">
        ✓ theme switched — run `theme` again to toggle back.
      </div>
    );
  }

  if (out.type === 'ls') {
    const dirs = Object.keys(FS).filter((k) => FS[k].kind === 'dir');
    const files = Object.keys(FS).filter((k) => FS[k].kind === 'file');
    return (
      <div>
        <div className="flex flex-wrap gap-x-[22px] gap-y-1">
          {dirs.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => onPick(`cd ${d.replace('/', '')}`)}
              className="cursor-pointer font-semibold text-(--t-accent) hover:underline"
            >
              {d}
            </button>
          ))}
          {files.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => onPick(`cat ${f}`)}
              className="cursor-pointer text-(--t-text) hover:underline"
            >
              {f}
            </button>
          ))}
        </div>
        <div className={`mt-1.5 ${commentClass}`}>
          {'// click a name, or run `cd <dir>` / `cat <file>`'}
        </div>
      </div>
    );
  }

  if (out.type === 'filelist') {
    return (
      <div>
        <div className="grid gap-0.5">
          {out.files.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => onPick(`cat ${f}`)}
              className="cursor-pointer text-left text-(--t-text) hover:underline"
            >
              <span className="text-(--t-dim)">-rw-r--r-- </span>
              {f}
            </button>
          ))}
        </div>
        {out.hint && (
          <div className={`mt-1.5 ${commentClass}`}>{`// ${out.hint}`}</div>
        )}
      </div>
    );
  }

  if (out.type === 'top') {
    return (
      <div className="w-full overflow-x-auto pb-1.5 text-[13px] [scrollbar-width:thin]">
        <div className="min-w-[460px]">
          <div className="mb-1 text-(--t-dim)">
            tasks: {PROJECTS.length} · load avg: caffeinated ☕ · uptime: 13
            years
          </div>
          <div className="flex gap-2.5 border-b border-(--t-border) pb-[3px] text-(--t-dim)">
            <span className="min-w-8">PID</span>
            <span className="min-w-[125px]">COMMAND</span>
            <span className="min-w-9">%CPU</span>
            <span className="min-w-8">MEM</span>
            <span>STATE</span>
          </div>
          {PROJECTS.map((p) => (
            <div key={p.pid} className="mt-[3px] flex gap-2.5">
              <span className="min-w-8 text-(--t-dim)">{p.pid}</span>
              <span className="min-w-[125px] text-(--t-bright)">{p.name}</span>
              <span
                className={`min-w-9 ${p.cpu > 30 ? 'text-(--t-green)' : 'text-(--t-dim)'}`}
              >
                {p.cpu.toFixed(1)}
              </span>
              <span className="min-w-8 text-(--t-dim)">{p.mem}</span>
              <span
                className={`whitespace-nowrap ${
                  p.state === 'RUNNING'
                    ? 'text-(--t-green)'
                    : p.state === 'SLEEPING'
                      ? 'text-(--t-accent)'
                      : 'text-(--t-amber)'
                }`}
              >
                {p.state}
                <span className="text-(--t-dim)"> ({p.note})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (out.type === 'uname') {
    if (!out.full) return <div className="text-(--t-bright)">KhriztianOS</div>;
    return (
      <div>
        <div className="text-(--t-bright)">
          KhriztianOS 2026.05 x86_64 TechLead-NodeJS-React — Medellín, Colombia
          🇨🇴
        </div>
        <div className={`mt-0.5 ${commentClass}`}>
          kernel: Curiosity 13.0 · shell: /bin/teach · pkg-mgr: community
        </div>
      </div>
    );
  }

  if (out.type === 'alias') {
    return (
      <div className="grid gap-0.5">
        {ALIASES.map((a) => (
          <div key={a.from}>
            <span className="text-(--t-dim)">alias </span>
            <span className="text-(--t-green)">{a.from}</span>
            <span className="text-(--t-dim)">=</span>
            <span className="text-(--t-accent)">{`'${a.to}'`}</span>
          </div>
        ))}
        <div className={`mt-1 ${commentClass}`}>
          {'// the suggested-command chips below are aliases too.'}
        </div>
      </div>
    );
  }

  if (out.type === 'history') {
    return (
      <div className="grid gap-px">
        {FAKE_HISTORY.map((h, i) => (
          <div key={i}>
            <span className="mr-3 whitespace-pre text-(--t-dim)">
              {String(i + 1).padStart(3, ' ')}
            </span>
            <span className="text-(--t-text)">{h}</span>
          </div>
        ))}
        {out.session.length > 0 && (
          <>
            <div className={`mb-px mt-1.5 ${commentClass}`}>
              ── this session ──
            </div>
            {out.session.map((h, i) => (
              <div key={`s${i}`}>
                <span className="mr-3 whitespace-pre text-(--t-dim)">
                  {String(FAKE_HISTORY.length + i + 1).padStart(3, ' ')}
                </span>
                <span className="text-(--t-green)">{h}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  if (out.type === 'curl') {
    let host = out.url;
    try {
      host = new URL(
        out.url.startsWith('http') ? out.url : `https://${out.url}`,
      ).hostname;
    } catch {
      // Falls back to the raw url if parsing fails.
    }
    return (
      <div className="text-[13px]">
        <div className="text-(--t-dim)">* Trying {host}…</div>
        <div className="text-(--t-dim)">* Connected — TLS handshake OK</div>
        <div className="mt-1 text-(--t-green)">{'{'}</div>
        <div className="pl-4 text-(--t-text)">
          {'"status": '}
          <span className="text-(--t-amber)">200</span>
          {','}
        </div>
        <div className="pl-4 text-(--t-text)">
          {'"community": '}
          <span className="text-(--t-accent)">{'"Medellin.js"'}</span>
          {','}
        </div>
        <div className="pl-4 text-(--t-text)">
          {'"developers": '}
          <span className="text-(--t-amber)">8000</span>
          {','}
        </div>
        <div className="pl-4 text-(--t-text)">
          {'"message": '}
          <span className="text-(--t-accent)">
            {'"Connected to 8,000+ developers. Success!"'}
          </span>
        </div>
        <div className="text-(--t-green)">{'}'}</div>
      </div>
    );
  }

  if (out.type === 'stack') {
    return (
      <div className="flex flex-wrap gap-2">
        {out.items.map((it) => (
          <span
            key={it}
            className="rounded-md border border-(--t-accent)/25 bg-(--t-accent)/5 px-2.5 py-1 text-[13px] text-(--t-accent)"
          >
            {it}
          </span>
        ))}
      </div>
    );
  }

  if (out.type === 'experience') {
    return (
      <div className="grid gap-0.5">
        <div className={`mb-1.5 ${commentClass}`}>
          $ git log --author=&quot;khriztianmoreno&quot; --oneline
        </div>
        {EXPERIENCE.map((e, i) => (
          <div key={e.co} className="flex gap-3">
            <span className="text-(--t-amber)">
              {(9 - i).toString(16).padStart(2, '0')}c{i}f
            </span>
            <div>
              <span className="font-semibold text-(--t-bright)">{e.role}</span>
              <span className="text-(--t-accent)"> @ {e.co}</span>
              <span className="text-(--t-dim)"> ({e.when})</span>
              <div className="mb-1.5 text-[12.5px] text-(--t-dim)">
                {e.note}
              </div>
            </div>
          </div>
        ))}
        <div className={`mt-0.5 ${commentClass}`}>
          {`// ${EXPERIENCE.length} roles · 2011 → present — run \`resume\` for the full PDF`}
        </div>
      </div>
    );
  }

  if (out.type === 'skills') {
    return (
      <div className="grid gap-1">
        {SKILLS.map((s) => (
          <SkillBar key={s.name} name={s.name} pct={s.pct} />
        ))}
      </div>
    );
  }

  if (out.type === 'awards') {
    return (
      <div className="grid gap-2">
        {AWARDS.map((a) => (
          <div
            key={a.tag}
            className="flex flex-wrap justify-between gap-2 border-l-2 border-(--t-amber) pl-3"
          >
            <span>
              <span className="font-bold text-(--t-amber)">{a.tag}</span>
              <span className="text-(--t-text)"> — {a.org}</span>
            </span>
            <span className="text-(--t-dim)">{a.since}</span>
          </div>
        ))}
        <div className={`mt-0.5 ${commentClass}`}>
          {'// recognized year after year as a top community builder worldwide.'}
        </div>
      </div>
    );
  }

  if (out.type === 'education') {
    return (
      <div className="grid gap-2">
        {EDUCATION.map((e) => (
          <div key={e.school} className="border-l-2 border-(--t-accent) pl-3">
            <div className="font-semibold text-(--t-bright)">{e.deg}</div>
            <div className="text-[13px] text-(--t-text)">{e.school}</div>
            <div className="text-xs text-(--t-dim)">{e.when}</div>
          </div>
        ))}
      </div>
    );
  }

  if (out.type === 'communities') {
    return (
      <div className="grid gap-[3px]">
        {COMMUNITIES.map((c) => (
          <a
            key={c.name}
            href={c.url}
            {...EXTERNAL}
            className={`flex gap-3 text-(--t-accent) ${linkClass}`}
          >
            <span className="min-w-[168px] text-(--t-green)">{c.name}</span>
            <span className="text-(--t-dim)">{c.note}</span>
          </a>
        ))}
      </div>
    );
  }

  if (out.type === 'socials') {
    return (
      <div className="grid gap-[3px]">
        {SOCIALS.map((s) => (
          <a
            key={s.key}
            href={s.url}
            {...EXTERNAL}
            className={`flex gap-3 text-(--t-accent) ${linkClass}`}
          >
            <span className="min-w-[92px] text-(--t-pink)">{s.key}</span>
            <span className="text-(--t-dim)">
              {s.url.replace('https://', '')}
            </span>
          </a>
        ))}
      </div>
    );
  }

  if (out.type === 'hire') {
    return (
      <div className="grid gap-[5px]">
        <div className="text-(--t-green)">$ cat ./hire.txt</div>
        <div>
          <span className="text-(--t-dim)">status </span>
          <span className="text-(--t-amber)">open to freelance & advisory</span>
        </div>
        <div>
          <span className="text-(--t-dim)">email </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`text-(--t-accent) ${linkClass}`}
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <div>
          <span className="text-(--t-dim)">also </span>
          <a
            href="https://www.linkedin.com/in/khriztianmoreno/"
            {...EXTERNAL}
            className={`text-(--t-accent) ${linkClass}`}
          >
            linkedin.com/in/khriztianmoreno
          </a>
        </div>
        <div className={`mt-1 ${commentClass}`}>
          {'// based in Medellín 🇨🇴 — remote-friendly across timezones'}
        </div>
      </div>
    );
  }

  if (out.type === 'banner') return <Banner />;

  if (out.type === 'error') {
    return (
      <div className="text-(--t-red)">
        {out.msg || 'command not found'}: {out.cmd}
        {out.suggest && (
          <span className="text-(--t-dim)">
            {'  '}— did you mean{' '}
            <span className="text-(--t-green)">{out.suggest}</span>?
          </span>
        )}
      </div>
    );
  }

  // `clear` is handled by the parent terminal — no output to render here.
  return null;
}
