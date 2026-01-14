import { useData } from '@/context/DataContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  const { year } = useData();

  return (
    <div className="bg-cdi-primary text-white py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {title ?? 'Commitment to Development Index'}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg mt-2 text-white/90 line-clamp-2">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold opacity-90">{year}</div>
            <button
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 md:px-4 md:py-2 rounded text-xs md:text-sm transition-colors whitespace-nowrap"
              onClick={() => {
                // TODO: Open modal with methodology info
                alert('How CDI Works - Coming soon');
              }}
            >
              How CDI Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
