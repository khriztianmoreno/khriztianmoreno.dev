'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Templates (unlike layouts) remount on every navigation, so this fade +
 * slight rise replays on each route change — between the portfolio home
 * and the blog, and between blog pages themselves.
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
