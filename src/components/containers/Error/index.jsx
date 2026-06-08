'use client';

import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

import Button from '../../common/Button';
import ErrorImage from '../../common/assets/image/404.svg';

const ErrorSec = () => {
  const pageReload = () => window.location.reload();

  return (
    <div
      style={{
        padding: '80px 15px',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ width: 450, maxWidth: '100%', margin: '0 auto' }}>
        <div
          style={{ marginBottom: 55 }}
          className="error-image-wrapper"
        >
          <img src={ErrorImage?.src || ErrorImage} alt="404" style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
        </div>

        <h2
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: '#0f2137',
            letterSpacing: '-0.025em',
            marginBottom: 25,
            lineHeight: 1.31,
            textAlign: 'center',
            fontFamily: 'poppins',
          }}
        >
          Page not found!
        </h2>

        <p
          style={{
            fontSize: 16,
            color: '#343d48',
            lineHeight: 2,
            marginBottom: 60,
            textAlign: 'center',
            fontFamily: 'lato',
          }}
        >
          Looks like the page you&apos;re trying to visit doesn&apos;t exist.
          Please check the URL and try your luck again.
        </p>

        <div style={{ fontFamily: 'roboto', textAlign: 'center' }}>
          <Button
            title="Reload Page"
            icon={<RotateCcw size={24} />}
            iconPosition="left"
            style={{ background: '#eaa03b', color: '#fff', margin: '0 8px' }}
            onClick={pageReload}
          />
          <Link href="/">
            <Button
              title="Go Home"
              icon={<Home size={24} />}
              iconPosition="left"
              style={{ background: '#e2e7f0', color: '#0f2137', margin: '0 8px' }}
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
