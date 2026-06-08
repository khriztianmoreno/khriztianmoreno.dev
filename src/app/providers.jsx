'use client';

import { useEffect } from 'react';
import { SettingsProvider } from '../components/common/contexts/Settings';

export default function Providers({ children }) {
  useEffect(() => {
    console.log(
      '%c HELLO FRIENDS THANK YOU FOR COMING TO THE CONSOLE',
      `
        background-color: #4B15C1;
        color: white;
        font-size: 2.8vw;
        line-height: 1;
        padding: 4rem 5vw;
      `
    );
  }, []);

  return <SettingsProvider>{children}</SettingsProvider>;
}
