import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';
import { FilterBar } from '@/components/filters/FilterBar';

// Component colors - same as ComponentPage
const COMPONENT_COLORS: Record<string, string> = {
  'development-finance': 'rgb(146, 101, 171)',
  'investment': 'rgb(68, 195, 255)',
  'migration': 'rgb(0, 129, 214)',
  'trade': 'rgb(29, 74, 184)',
  'environment': 'rgb(255, 193, 39)',
  'health': 'rgb(255, 157, 58)',
  'security': 'rgb(241, 100, 0)',
  'technology': 'rgb(204, 85, 0)'
};

// Header colors for component tabs
const HEADER_COLORS: Record<string, string> = {
  'development-finance': 'rgb(116, 80, 137)',
  'investment': 'rgb(55, 156, 204)',
  'migration': 'rgb(0, 103, 171)',
  'trade': 'rgb(23, 59, 147)',
  'environment': 'rgb(204, 154, 31)',
  'health': 'rgb(204, 126, 46)',
  'security': 'rgb(193, 80, 0)',
  'technology': 'rgb(163, 68, 0)'
};

export function SubcomponentPage() {
  const { componentId, subcomponentId } = useParams<{
    componentId: string;
    subcomponentId: string;
  }>();
  const { loading, error, getComponent, components, subcomponents, countries } = useData();
  useFilters(); // Keep filter context active for FilterBar

  const component = getComponent(componentId ?? '');
  const subcomponent = subcomponents.find(s => s.id === subcomponentId);

  // Get all subcomponents for this component (for sidebar)
  const componentSubcomponents = useMemo(() => {
    if (!component) return [];
    return subcomponents.filter(s => s.componentId === component.id);
  }, [subcomponents, component]);

  // Calculate rankings for this subcomponent
  const rankedCountries = useMemo(() => {
    if (!subcomponent || !component) return [];

    return countries
      .map(country => {
        const compScore = country.components[component.id];
        const subScore = compScore?.subcomponents?.[subcomponent.id];
        return {
          country,
          score: subScore?.score ?? 0,
          rank: subScore?.rank ?? 999
        };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [countries, component, subcomponent]);

  // Calculate min, max, median for the bar chart
  const stats = useMemo(() => {
    const scores = rankedCountries.map(r => r.score);
    if (scores.length === 0) return { min: 0, max: 100, median: 50 };

    const sorted = [...scores].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    return { min, max, median };
  }, [rankedCountries]);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  if (!component || !subcomponent) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subcomponent not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  const componentColor = COMPONENT_COLORS[component.id] || component.color;

  // Format number for display
  const formatNumber = (n: number) => {
    if (Math.abs(n) >= 1000) return n.toFixed(0);
    if (Math.abs(n) >= 100) return n.toFixed(1);
    if (Math.abs(n) >= 10) return n.toFixed(2);
    return n.toFixed(2);
  };

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar />

      {/* Component Tabs Row */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            {/* Rank/Overall section */}
            <div className="flex items-center mr-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide mr-4">Rank</span>
              <Link
                to="/"
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-cdi-primary"
              >
                Overall
              </Link>
            </div>

            {/* Component tabs */}
            <div className="flex flex-1 overflow-x-auto">
              {components.map(comp => {
                const isActive = comp.id === component.id;
                const tabColor = COMPONENT_COLORS[comp.id] || comp.color;
                const tabHeaderColor = HEADER_COLORS[comp.id] || tabColor;

                return (
                  <Link
                    key={comp.id}
                    to={`/component/${comp.id}`}
                    className={`px-3 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap border-b-3 transition-colors ${
                      isActive ? 'border-current' : 'border-transparent hover:opacity-80'
                    }`}
                    style={{
                      color: isActive ? tabHeaderColor : tabColor,
                      borderBottomColor: isActive ? tabHeaderColor : 'transparent',
                      borderBottomWidth: '3px'
                    }}
                  >
                    {comp.shortName}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Two columns */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Subcomponent description */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {subcomponent.name}
            </h1>
            <p className="text-lg italic text-gray-600 mb-6">
              {subcomponent.subtitle}
            </p>

            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
              {subcomponent.description.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <p className="mt-6 text-gray-600">
              The weight of this indicator is <strong>{subcomponent.weight}</strong>.
            </p>
          </div>

          {/* Right column - Component sidebar */}
          <div className="lg:w-1/3">
            <div
              className="border-b-4 pb-2 mb-2"
              style={{ borderColor: componentColor }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: componentColor }}
              >
                {component.name}
              </h3>
            </div>

            <div className="space-y-0">
              {componentSubcomponents.map(subcomp => {
                const isActive = subcomp.id === subcomponent.id;
                return (
                  <Link
                    key={subcomp.id}
                    to={`/component/${component.id}/${subcomp.id}`}
                    className={`block py-2 px-3 text-sm transition-colors ${
                      isActive
                        ? 'font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ color: isActive ? componentColor : '#666' }}
                  >
                    {subcomp.name}
                    {isActive && (
                      <span className="ml-2 text-gray-400">&gt;</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rankings table section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {subcomponent.name}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {subcomponent.subtitle}
          </p>

          {/* Rankings table */}
          <div className="space-y-2">
            {rankedCountries.map(({ country, score, rank }) => {
              // Calculate bar position
              const range = stats.max - stats.min;
              const scorePercent = range > 0
                ? ((score - stats.min) / range) * 100
                : 50;
              const medianPercent = range > 0
                ? ((stats.median - stats.min) / range) * 100
                : 50;

              return (
                <div
                  key={country.id}
                  className="flex items-center gap-4 py-3 border-b border-gray-100"
                >
                  {/* Rank */}
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: componentColor }}
                  >
                    {rank}
                  </div>

                  {/* Country name */}
                  <div className="w-32 flex-shrink-0">
                    <Link
                      to={`/country/${country.id}`}
                      className="text-sm font-medium text-gray-700 hover:text-cdi-primary hover:underline"
                    >
                      {country.name}
                    </Link>
                  </div>

                  {/* Score bar */}
                  <div className="flex-1 px-4">
                    {/* Value above bar */}
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{
                        marginLeft: `${Math.min(Math.max(scorePercent - 3, 0), 94)}%`
                      }}
                    >
                      {formatNumber(score)}
                    </div>

                    {/* Bar container */}
                    <div className="relative h-4 bg-gray-200">
                      {/* Score bar */}
                      <div
                        className="absolute top-0 left-0 h-full"
                        style={{
                          width: `${Math.max(scorePercent, 1)}%`,
                          backgroundColor: componentColor
                        }}
                      />

                      {/* Median marker */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-gray-600"
                        style={{ left: `${medianPercent}%` }}
                      >
                        <span className="absolute top-full mt-1 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                          Median
                        </span>
                      </div>
                    </div>

                    {/* Min/Max labels */}
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>{formatNumber(stats.min)}</span>
                      <span>{formatNumber(stats.max)}</span>
                    </div>
                  </div>

                  {/* Score value on right */}
                  <div className="w-24 text-right flex-shrink-0">
                    <span
                      className="text-lg font-bold"
                      style={{ color: componentColor }}
                    >
                      {formatNumber(score)}
                    </span>
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <span className="uppercase tracking-wide">Info: </span>
          <Link
            to={`/component/${component.id}`}
            className="text-cdi-primary hover:underline uppercase tracking-wide"
            style={{ color: componentColor }}
          >
            {component.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
