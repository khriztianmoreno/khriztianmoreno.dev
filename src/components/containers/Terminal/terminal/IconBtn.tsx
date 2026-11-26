import type { ReactNode } from 'react';

interface IconBtnProps {
  children: ReactNode;
  onClick?: () => void;
  title: string;
}

// Small square icon button used in the window chrome.
export function IconBtn({ children, onClick, title }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex size-7 cursor-pointer items-center justify-center rounded-[7px] border border-primary/20 bg-transparent font-mono text-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </button>
  );
}
