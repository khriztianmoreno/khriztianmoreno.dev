import React, { useEffect } from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawerHandler: React.ReactNode;
  children: React.ReactNode;
}

const Drawer = ({ open, onOpenChange, drawerHandler, children }: DrawerProps) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div style={{ display: 'inline-flex' }} onClick={() => onOpenChange(!open)}>{drawerHandler}</div>
      {open && (
        <>
          <div
            className="drawer-overlay"
            aria-hidden="true"
            onClick={() => onOpenChange(false)}
          />
          <div className="drawer-content-wrapper" data-state="open" role="dialog" aria-label="Navigation menu">
            <button
              className="drawer-close-btn"
              aria-label="Close menu"
              onClick={() => onOpenChange(false)}
            />
            <div className="drawer-content">{children}</div>
          </div>
        </>
      )}
    </>
  );
};

export default Drawer;
