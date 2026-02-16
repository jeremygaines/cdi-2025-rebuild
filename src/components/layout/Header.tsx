import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-cdi-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-lg font-semibold">
            Center for Global Development
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <a
            href="https://www.cgdev.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            CGD Home
          </a>
        </nav>
      </div>
    </header>
  );
}
