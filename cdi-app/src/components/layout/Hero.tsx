import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
  showKeyFindings?: boolean;
}

const KEY_FINDINGS = [
  "The CDI ranks the world's most powerful countries on policies that affect global prosperity. Because development depends on more than foreign aid, the CDI examines 8 key policy areas and scores countries relative to their size.",

  "Though Sweden comes 1st for the fifth time in a row, its lead continues to shrink. Germany is 2nd overall and emerges as the top G7 country, accepting large numbers of migrants and refugees. Norway comes 3rd, and top on investment.",

  "Fossil fuel subsidies rose in most countries in response to energy price spikes resulting from Russia's invasion of Ukraine, though 10 countries, including Australia and Türkiye, reduced them despite these pressures.",

  "Most countries, with some exceptions like Luxembourg, are giving less finance for development than in 2023. Fewer are channelling funds through multilateral organizations, and aid is increasingly directed away from the poorest countries.",

  "Just over three-quarters of CDI countries cut their emissions per person between 2019 and 2023, but overall emissions across those countries still rose, driven by emissions increases in China (which ranked 34th overall).",

  "As wealthier countries might be expected to contribute more, we allow users to \"income-adjust\" scores. Portugal, Czechia, and Spain move up to the top 10 in income-adjusted rankings."
];

export function Hero({ title, subtitle, showKeyFindings = true }: HeroProps) {
  const { year } = useData();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides every 6 seconds
  useEffect(() => {
    if (!showKeyFindings || subtitle) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % KEY_FINDINGS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [showKeyFindings, subtitle]);

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

            {/* Right side - Key findings slider */}
            {showKeyFindings && !subtitle && (
              <div className="lg:max-w-md xl:max-w-lg">
                <div className="relative">
                  {/* Slider content */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {KEY_FINDINGS.map((finding, index) => (
                        <div
                          key={index}
                          className="w-full flex-shrink-0"
                        >
                          <p className="text-sm md:text-base italic text-white/90 leading-relaxed">
                            {finding}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {KEY_FINDINGS.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? 'bg-white w-6'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
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
