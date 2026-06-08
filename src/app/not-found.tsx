import { type Metadata } from 'next';
import ErrorSec from '../components/containers/Error';

export const metadata: Metadata = {
  title: '404 — Page not found',
};

export default function NotFound() {
  return <ErrorSec />;
}
