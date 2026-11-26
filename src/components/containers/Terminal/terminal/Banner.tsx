import styles from './Terminal.module.css';

// ASCII welcome banner rendered when the terminal first boots and on `banner`.
export function Banner() {
  return (
    <div className="mb-[18px]">
      <pre
        className={`${styles.bannerAscii} m-0 max-w-full overflow-x-auto whitespace-pre font-bold leading-[1.15] text-(--t-accent) [text-shadow:0_0_18px_color-mix(in_srgb,var(--t-accent)_33%,transparent)]`}
      >
        {` _    _          _     _   _
| | _| |__  _ __(_)___| |_(_) __ _ _ __  _ __ ___   ___  _ __ ___ _ __  ___
| |/ / '_ \\| '__| |_  / __| |/ _\` | '_ \\| '_ \` _ \\ / _ \\| '__/ _ \\ '_ \\/ _ \\
|   <| | | | |  | |/ /| |_| | (_| | | | | | | | | | (_) | | |  __/ | | (_) |
|_|\\_\\_| |_|_|  |_/___|\\__|_|\\__,_|_| |_|_| |_| |_|\\___/|_|  \\___|_| |_\\___/`}
      </pre>
      <div className="mt-3 text-[13px] text-(--t-text)">
        AI Fullstack Engineer — booted as a Warp session.
      </div>
      <div className="mt-1 text-xs text-(--t-dim)">
        Type <span className="text-(--t-green)">ls</span> to look around,{' '}
        <span className="text-(--t-green)">help</span> for all commands, or hit{' '}
        <span className="text-(--t-accent)">⌘K</span> ↓
      </div>
    </div>
  );
}
