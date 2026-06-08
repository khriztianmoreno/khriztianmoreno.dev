import React, { useEffect, useState } from 'react';
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

const ScrollSpyMenu = ({ className = '', menuItems = [], onClose }: ScrollSpyMenuProps) => {
  const sectionIds = menuItems
    .filter((item) => !item.staticLink)
    .map((item) => item.path.slice(1));

  const activeId = useScrollSpy(sectionIds);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, offset = 0) => {
    e.preventDefault();
    const id = path.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    if (onClose) onClose();
  };

  const classes = ['scrollspy__menu', className].filter(Boolean).join(' ');

  return (
    <ul className={classes}>
      {menuItems.map((menu, index) => (
        <li
          key={`menu-item-${index}`}
          className={
            !menu.staticLink && activeId === menu.path.slice(1) ? 'is-current' : ''
          }
        >
          {menu.staticLink ? (
            <a href={menu.path}>{menu.label}</a>
          ) : (
            <a
              href={menu.path}
              onClick={(e) => handleAnchorClick(e, menu.path, Number(menu.offset) || 0)}
            >
              {menu.label}
            </a>
          )}
        </li>
      ))}
      <li>
        <a
          href="https://blog.khriztianmoreno.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          BLOG
        </a>
      </li>
    </ul>
  );
};

export default ScrollSpyMenu;
