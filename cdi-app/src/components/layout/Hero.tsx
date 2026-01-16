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
              <div className="w-auto h-16 md:h-20 flex-shrink-0">
                <img
                  src="/cdi-logo.png"
                  alt="CDI Logo"
                  className="h-full w-auto object-contain"
                />
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
