import { useData } from '@/context/DataContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
  showKeyFindings?: boolean;
}

export function Hero({ title, subtitle, showKeyFindings = true }: HeroProps) {
  const { year } = useData();

  // Key findings text - can be made dynamic later
  const keyFindings = `Though Sweden comes 1st for the fifth time in a row, its lead continues to shrink. Germany is 2nd overall and emerges as the top G7 country, accepting large numbers of migrants and refugees. Norway comes 3rd, and top on investment.`;

  return (
    <div>
      {/* Main hero section */}
      <div className="bg-cdi-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side - Logo and title */}
            <div className="flex items-center gap-4">
              {/* CDI Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#3D5C5C" stroke="#5A7A7A" strokeWidth="2"/>
                  <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">CDI</text>
                  {/* Decorative segments */}
                  <path d="M50 10 A40 40 0 0 1 85 35" stroke="#1B998B" strokeWidth="6" fill="none"/>
                  <path d="M85 35 A40 40 0 0 1 85 65" stroke="#4A90D9" strokeWidth="6" fill="none"/>
                  <path d="M85 65 A40 40 0 0 1 50 90" stroke="#7B68EE" strokeWidth="6" fill="none"/>
                  <path d="M50 90 A40 40 0 0 1 15 65" stroke="#DAA520" strokeWidth="6" fill="none"/>
                  <path d="M15 65 A40 40 0 0 1 15 35" stroke="#E57C23" strokeWidth="6" fill="none"/>
                  <path d="M15 35 A40 40 0 0 1 50 10" stroke="#CD5C5C" strokeWidth="6" fill="none"/>
                </svg>
              </div>
              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide">
                {title ?? (
                  <>
                    THE COMMITMENT TO<br />
                    <span className="font-normal">DEVELOPMENT INDEX {year}</span>
                  </>
                )}
              </h1>
            </div>

            {/* Right side - Key findings */}
            {showKeyFindings && !subtitle && (
              <div className="lg:max-w-md xl:max-w-lg">
                <p className="text-sm md:text-base italic text-white/90 leading-relaxed">
                  {keyFindings}
                </p>
              </div>
            )}

            {/* Subtitle if provided */}
            {subtitle && (
              <div className="lg:max-w-md">
                <p className="text-base md:text-lg text-white/90">
                  {subtitle}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About link section */}
      <div className="bg-cdi-dark border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <a
            href="https://www.cgdev.org/cdi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white text-sm hover:underline"
          >
            About CDI and key findings
          </a>
        </div>
      </div>
    </div>
  );
}
