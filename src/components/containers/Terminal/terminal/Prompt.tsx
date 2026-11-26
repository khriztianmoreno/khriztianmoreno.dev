interface PromptProps {
  path: string;
}

// Colored "user:path ❯" prompt prefix shown before each command in history.
export function Prompt({ path }: PromptProps) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-(--t-green)">khriztianmoreno</span>
      <span className="text-(--t-dim)">:</span>
      <span className="text-(--t-pink)">{path || '~/portfolio'}</span>
      <span className="text-(--t-accent)"> ❯</span>
    </span>
  );
}
