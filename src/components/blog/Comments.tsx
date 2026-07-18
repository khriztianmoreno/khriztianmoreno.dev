'use client';

import { useEffect, useRef } from 'react';
import { type Lang } from '@/lib/blog/schema';

interface CommentsProps {
  lang: Lang;
}

const GISCUS_REPO = 'khriztianmoreno/blog.khriztianmoreno.dev';
const GISCUS_REPO_ID = 'R_kgDONVQjMQ';
const GISCUS_CATEGORY = 'Blog Post Comments';
const GISCUS_CATEGORY_ID = 'DIC_kwDONVQjMc4Clrjc';

const Comments = ({ lang }: CommentsProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', GISCUS_REPO);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID);
    script.setAttribute('data-category', GISCUS_CATEGORY);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'url');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'transparent_dark');
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-loading', 'lazy');

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [lang]);

  return <div ref={ref} className="giscus mx-auto mt-16 w-full max-w-200" />;
};

export default Comments;
