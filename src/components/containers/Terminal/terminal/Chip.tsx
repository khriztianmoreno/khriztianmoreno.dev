interface ChipProps {
  icon: string;
  text: string;
  /** Tailwind text-color class, e.g. `text-(--t-green)`. */
  colorClass: string;
}

// Pill-shaped status indicator used in the prompt and status bars.
export function Chip({ icon, text, colorClass }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-md border border-(--t-chip-border) bg-(--t-chip) px-2 py-0.5 text-[11.5px] ${colorClass}`}
    >
      <span className="opacity-85">{icon}</span>
      {text}
    </span>
  );
}
