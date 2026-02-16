import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <footer className="bg-gray-100 border-t py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Footer navigation */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4 text-sm">
            <Link to="/" className="text-cdi-primary hover:underline">
              CDI Rankings
            </Link>
            <Link to="/indicators" className="text-cdi-primary hover:underline">
              All Indicators
            </Link>
            <a
              href="https://www.cgdev.org/cdi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cdi-primary hover:underline"
            >
              About CDI
            </a>
          </div>
          {/* Attribution */}
          <p className="text-center text-sm text-gray-600">
            The Commitment to Development Index is produced by the{' '}
            <a
              href="https://www.cgdev.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cdi-primary hover:underline"
            >
              Center for Global Development
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
