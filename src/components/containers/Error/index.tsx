'use client';

import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

import Button from '../../common/Button';
import ErrorImage from '../../common/assets/image/404.svg';

const ErrorSec = () => {
  const pageReload = () => window.location.reload();

  return (
    <div className="flex items-center h-screen px-4 py-20">
      <div className="mx-auto w-112 max-w-full">
        <div className="error-image-wrapper mb-14">
          <img
            src={(ErrorImage as { src?: string })?.src ?? String(ErrorImage)}
            alt="404"
            className="block max-w-full h-auto"
          />
        </div>

        <h2 className="mb-6 text-5xl font-semibold text-ink leading-tight tracking-tight text-center font-[poppins]">
          Page not found!
        </h2>

        <p className="mb-15 text-base text-ink-soft leading-loose text-center font-[lato]">
          Looks like the page you&apos;re trying to visit doesn&apos;t exist.
          Please check the URL and try your luck again.
        </p>

        <div className="text-center font-[roboto]">
          <Button
            title="Reload Page"
            icon={<RotateCcw size={24} />}
            iconPosition="left"
            className="bg-warning! text-white! mx-2"
            onClick={pageReload}
          />
          <Link href="/">
            <Button
              title="Go Home"
              icon={<Home size={24} />}
              iconPosition="left"
              className="bg-surface-soft! text-ink! mx-2"
            />
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 1480px) {
          .error-image-wrapper { max-width: 80%; margin-left: auto; margin-right: auto; }
        }
      `}</style>
    </div>
  );
};

export default ErrorSec;
