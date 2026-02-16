import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded mb-6 text-sm">
                <summary className="cursor-pointer text-gray-500">Error details</summary>
                <pre className="mt-2 overflow-auto text-red-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-cdi-primary text-white px-6 py-2 rounded hover:bg-cdi-dark transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
