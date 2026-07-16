'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type MenuItem } from '../assets/data';

function useScrollSpy(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return activeId;
}

interface ScrollSpyMenuProps {
  className?: string;
  menuItems?: MenuItem[];
  onClose?: () => void;
}

/**
 * Whether a static (non-anchor) menu item's route is the current page.
 * Matches the item's path as a route prefix, not an exact string, so
 * `/blog` stays highlighted on `/blog/[slug]`, `/blog/tags`, and their
 * `/es/blog/...` mirrors — not just the exact index route.
 */
function isStaticLinkActive(pathname: string, path: string): boolean {
  const localizedPath = `/es${path}`;
  return (
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    pathname === localizedPath ||
    pathname.startsWith(`${localizedPath}/`)
  );
}

const ScrollSpyMenu = ({ className = '', menuItems = [], onClose }: ScrollSpyMenuProps) => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const sectionIds = menuItems
    .filter((item) => !item.staticLink)
    .map((item) => item.path.slice(1));

  const activeId = useScrollSpy(sectionIds);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, offset = 0) => {
    // Section anchors only exist on the home page. From any other route
    // (e.g. /blog, /blog/[slug]) there's no matching element to scroll to,
    // so navigate to the home page with the anchor instead of silently
    // no-op'ing via a `document.getElementById` miss.
    if (!isHome) {
      onClose?.();
      return;
    }

    e.preventDefault();
    const id = path.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    onClose?.();
  };

  const classes = ['scrollspy__menu', className].filter(Boolean).join(' ');

  return (
    <ul className={classes}>
      {menuItems.map((menu, index) => (
        <li
          key={`menu-item-${index}`}
          className={
            menu.staticLink
              ? isStaticLinkActive(pathname, menu.path)
                ? 'is-current'
                : ''
              : isHome && activeId === menu.path.slice(1)
                ? 'is-current'
                : ''
          }
        >
          {menu.staticLink ? (
            <Link href={menu.path} onClick={onClose}>
              {menu.label}
            </Link>
          ) : (
            <Link
              href={isHome ? menu.path : `/${menu.path}`}
              onClick={(e) => handleAnchorClick(e, menu.path, Number(menu.offset) || 0)}
            >
              {menu.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ScrollSpyMenu;
