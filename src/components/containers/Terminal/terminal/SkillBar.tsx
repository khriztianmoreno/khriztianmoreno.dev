interface SkillBarProps {
  name: string;
  pct: number;
}

// Single skill row rendered as a 10-cell progress bar.
export function SkillBar({ name, pct }: SkillBarProps) {
  const filled = Math.round(pct / 10);
  const colorClass =
    pct >= 90
      ? 'text-(--t-green)'
      : pct >= 75
        ? 'text-(--t-accent)'
        : 'text-(--t-amber)';

  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="min-w-[116px] text-(--t-text)">{name}</span>
      <span className={`tracking-[1px] ${colorClass}`}>
        {'█'.repeat(filled)}
        <span className="text-(--t-track)">{'░'.repeat(10 - filled)}</span>
      </span>
      <span className="text-(--t-dim)">{pct}%</span>
    </div>
  );
}
