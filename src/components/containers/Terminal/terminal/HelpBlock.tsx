import { CMD_NAMES, COMMANDS } from '../data/commands';

interface HelpBlockProps {
  onPick: (cmd: string) => void;
}

// Renders the full command catalog produced by the `help` command.
export function HelpBlock({ onPick }: HelpBlockProps) {
  return (
    <div className="grid gap-1">
      {CMD_NAMES.map((name) => (
        <button
          type="button"
          key={name}
          onClick={() => onPick(name)}
          className="flex cursor-pointer gap-3.5 rounded-[5px] px-1.5 py-[3px] text-left hover:bg-(--t-hover)"
        >
          <span className="min-w-[104px] shrink-0 text-(--t-green)">{name}</span>
          <span className="text-(--t-dim)">{COMMANDS[name].desc}</span>
        </button>
      ))}
      <div className="mt-1 text-xs text-(--t-dim)">
        {'// also try unix commands: ls · cd · cat · pwd · uname -a · history · top · curl · sudo'}
      </div>
    </div>
  );
}
