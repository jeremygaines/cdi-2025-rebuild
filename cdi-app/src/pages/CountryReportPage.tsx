import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';

// Component colors from the live site
const COMPONENT_COLORS: Record<string, string> = {
  'development-finance': 'rgb(146, 101, 171)',
  'investment': 'rgb(68, 195, 255)',
  'migration': 'rgb(0, 129, 214)',
  'trade': 'rgb(29, 74, 184)',
  'environment': 'rgb(255, 193, 39)',
  'health': 'rgb(255, 157, 58)',
  'security': 'rgb(241, 100, 0)',
  'technology': 'rgb(204, 85, 0)',
};

// Component group colors (darker header shades)
const GROUP_HEADER_COLORS: Record<string, string> = {
  'development-finance': 'rgb(133, 87, 158)',
  'investment': 'rgb(41, 187, 255)',
  'migration': 'rgb(0, 110, 182)',
  'trade': 'rgb(20, 60, 160)',
  'environment': 'rgb(230, 174, 30)',
  'health': 'rgb(230, 140, 50)',
  'security': 'rgb(220, 90, 0)',
  'technology': 'rgb(180, 75, 0)',
};

// Group names
const COMPONENT_GROUPS: Record<string, string> = {
  'development-finance': 'Development Finance',
  'investment': 'Exchange',
  'migration': 'Exchange',
  'trade': 'Exchange',
  'environment': 'Global Public Goods',
  'health': 'Global Public Goods',
  'security': 'Global Public Goods',
  'technology': 'Global Public Goods',
};

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function CountryReportPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const { loading, error, getCountry, countries, components, subcomponents, indicators } = useData();
  const { showAdjusted } = useFilters();
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set(components.map(c => c.id)));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  const country = getCountry(countryId ?? '');
  if (!country) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Country not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  const rank = showAdjusted ? country.rankAdjusted : country.rank;

  // Placeholder overview text
  const overviewText = `${country.name} ranks ${rank}${getOrdinalSuffix(rank)} in the Commitment to Development Index. It ranks in the top half on all components except for technology, and scores particularly well on both health and security, where it ranks 1st place.

When we assess ${country.name}'s score relative to expectations based on its income level, its rank ${country.rankAdjusted < country.rank ? 'increases' : country.rankAdjusted > country.rank ? 'falls' : 'stays the same'}${country.rankAdjusted !== country.rank ? ` to ${country.rankAdjusted}${getOrdinalSuffix(country.rankAdjusted)}` : ''}. Full income-adjusted results are at the end of the country report.`;

  const toggleComponent = (componentId: string) => {
    setExpandedComponents(prev => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setExpandedComponents(new Set());
  };

  const expandAll = () => {
    setExpandedComponents(new Set(components.map(c => c.id)));
  };

  // Get component subcomponents
  const getComponentSubcomponents = (componentId: string) => {
    return subcomponents.filter(s => s.componentId === componentId);
  };

  // Get subcomponent indicators
  const getSubcomponentIndicators = (subcomponentId: string) => {
    return indicators.filter(i => i.subcomponentId === subcomponentId);
  };

  // Calculate min/max/median for scoring bars
  const getStats = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 100, median: 50 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return { min, max, median };
  };

  const getComponentStats = (componentId: string) => {
    const scores = countries.map(c => {
      const compScore = c.components[componentId];
      return showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
    }).filter((s): s is number => s !== undefined);
    return getStats(scores);
  };

  // Share URLs
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${country.name} ranks ${rank}${getOrdinalSuffix(rank)} in @cgdev's 2025 Commitment to Development Index. See the full results`;

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // Group components by their group
  const financeComponents = components.filter(c => c.group === 'finance');
  const exchangeComponents = components.filter(c => c.group === 'exchange');
  const globalComponents = components.filter(c => c.group === 'global');

  // Sorted countries for dropdown
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar - Go back link */}
      <div className="bg-[rgb(245,243,238)] border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to="/" className="text-cdi-primary hover:underline flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            GO BACK TO MAIN CDI PAGE
          </Link>
        </div>
      </div>

      {/* Country bar */}
      <div className="bg-cdi-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Country selector */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center gap-2 text-2xl font-bold hover:opacity-80"
              >
                {country.name}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white text-gray-800 rounded shadow-lg max-h-96 overflow-y-auto z-50 min-w-[200px]">
                  {sortedCountries.map(c => (
                    <Link
                      key={c.id}
                      to={`/country/${c.id}`}
                      className={`block px-4 py-2 hover:bg-gray-100 ${c.id === country.id ? 'bg-gray-100 font-semibold' : ''}`}
                      onClick={() => setShowCountryDropdown(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Print and Share */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-white hover:opacity-80"
              >
                PRINT REPORT
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <span>Share</span>
                <button onClick={handleFacebookShare} className="hover:opacity-80">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button onClick={handleTwitterShare} className="hover:opacity-80">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component tabs */}
      <div className="border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {components.map(component => {
              const compScore = country.components[component.id];
              const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
              const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;
              const color = COMPONENT_COLORS[component.id] || component.color;

              return (
                <button
                  key={component.id}
                  onClick={() => {
                    const element = document.getElementById(`component-${component.id}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 p-3 text-left hover:bg-gray-50 transition-colors min-w-[120px]"
                  style={{ borderBottom: `3px solid ${color}`, color }}
                >
                  <div className="font-semibold text-sm">{component.shortName}</div>
                  <div className="text-xs mt-1 text-gray-500">score</div>
                  <div className="font-bold">{Math.round(displayScore ?? 0)}%</div>
                  <div className="text-xs">/ {displayRank}{getOrdinalSuffix(displayRank ?? 0)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overall panel */}
      <div className="bg-[rgb(245,243,238)] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-left space-y-4">
            {overviewText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <button
            onClick={expandedComponents.size > 0 ? collapseAll : expandAll}
            className="mt-6 border border-cdi-primary text-cdi-primary px-6 py-2 uppercase text-sm font-medium hover:bg-cdi-primary hover:text-white transition-colors"
          >
            {expandedComponents.size > 0 ? 'Collapse' : 'Expand'} all component information
            <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedComponents.size > 0 ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Component sections */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Development Finance Group */}
        <ComponentGroupSection
          title="Development Finance"
          components={financeComponents}
          country={country}
          showAdjusted={showAdjusted}
          expandedComponents={expandedComponents}
          toggleComponent={toggleComponent}
          getComponentSubcomponents={getComponentSubcomponents}
          getSubcomponentIndicators={getSubcomponentIndicators}
          getComponentStats={getComponentStats}
          countries={countries}
        />

        {/* Exchange Group */}
        <ComponentGroupSection
          title="Exchange"
          components={exchangeComponents}
          country={country}
          showAdjusted={showAdjusted}
          expandedComponents={expandedComponents}
          toggleComponent={toggleComponent}
          getComponentSubcomponents={getComponentSubcomponents}
          getSubcomponentIndicators={getSubcomponentIndicators}
          getComponentStats={getComponentStats}
          countries={countries}
        />

        {/* Global Public Goods Group */}
        <ComponentGroupSection
          title="Global Public Goods"
          components={globalComponents}
          country={country}
          showAdjusted={showAdjusted}
          expandedComponents={expandedComponents}
          toggleComponent={toggleComponent}
          getComponentSubcomponents={getComponentSubcomponents}
          getSubcomponentIndicators={getSubcomponentIndicators}
          getComponentStats={getComponentStats}
          countries={countries}
        />
      </div>

      {/* Income-adjusted section */}
      <div className="bg-[rgb(245,243,238)] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Income-Adjusted Results</h2>
          <p className="text-gray-700 mb-4">
            When we assess {country.name} relative to expectations based on its income level,
            its income-adjusted rank is <strong>#{country.rankAdjusted}</strong> (compared to
            #{country.rank} in the standard ranking).
          </p>
          <p className="text-gray-700">
            The income-adjusted score is <strong>{country.scoreAdjusted.toFixed(1)}</strong> (compared to {' '}
            {country.score.toFixed(1)} in the standard ranking).
          </p>
        </div>
      </div>

      {/* Back to rankings */}
      <div className="py-8 text-center">
        <Link
          to="/"
          className="bg-cdi-primary text-white px-8 py-3 font-medium hover:bg-cdi-dark transition-colors uppercase tracking-wide inline-block"
        >
          Back to Main Rankings
        </Link>
      </div>
    </div>
  );
}

// Component Group Section
interface ComponentGroupSectionProps {
  title: string;
  components: ReturnType<typeof useData>['components'];
  country: NonNullable<ReturnType<ReturnType<typeof useData>['getCountry']>>;
  showAdjusted: boolean;
  expandedComponents: Set<string>;
  toggleComponent: (id: string) => void;
  getComponentSubcomponents: (id: string) => ReturnType<typeof useData>['subcomponents'];
  getSubcomponentIndicators: (id: string) => ReturnType<typeof useData>['indicators'];
  getComponentStats: (id: string) => { min: number; max: number; median: number };
  countries: ReturnType<typeof useData>['countries'];
}

function ComponentGroupSection({
  title,
  components,
  country,
  showAdjusted,
  expandedComponents,
  toggleComponent,
  getComponentSubcomponents,
  getSubcomponentIndicators,
  getComponentStats,
  countries,
}: ComponentGroupSectionProps) {
  if (components.length === 0) return null;

  return (
    <div className="mb-12 border rounded-lg overflow-hidden">
      {/* Group header */}
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      </div>

      <div className="p-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {components.map(component => {
            const compScore = country.components[component.id];
            const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
            const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;
            const color = COMPONENT_COLORS[component.id] || component.color;
            const headerColor = GROUP_HEADER_COLORS[component.id] || color;
            const isExpanded = expandedComponents.has(component.id);
            const compSubcomponents = getComponentSubcomponents(component.id);

            // Placeholder component description
            const componentDescription = `${country.name} ranks ${displayRank}${getOrdinalSuffix(displayRank ?? 0)} on ${component.name.toLowerCase()}. This component measures various aspects of the country's policies and their impact on development.`;

            return (
              <div
                key={component.id}
                id={`component-${component.id}`}
                className="col-span-1 lg:col-span-3"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Component card */}
                  <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="rounded overflow-hidden shadow">
                      <div
                        className="text-white p-3 text-sm"
                        style={{ backgroundColor: headerColor }}
                      >
                        <span className="opacity-80">{COMPONENT_GROUPS[component.id]}</span>
                        <div className="font-bold mt-1">{component.name}</div>
                      </div>
                      <div
                        className="p-4 text-white"
                        style={{ backgroundColor: color }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="text-xs opacity-80">Rank</div>
                            <div className="text-3xl font-bold">
                              {displayRank}
                              <span className="text-lg">{getOrdinalSuffix(displayRank ?? 0)}</span>
                            </div>
                            <div className="text-xs opacity-80">of {countries.length}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs opacity-80">Score</div>
                            <div className="text-3xl font-bold">{Math.round(displayScore ?? 0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component description and subcomponents */}
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{componentDescription}</p>

                    <button
                      onClick={() => toggleComponent(component.id)}
                      className="text-cdi-primary hover:underline text-sm flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide' : 'Show'} subcomponent details
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        {compSubcomponents.map(sub => {
                          const subScore = compScore?.subcomponents?.[sub.id];
                          const stats = getComponentStats(component.id);
                          const subIndicators = getSubcomponentIndicators(sub.id);

                          // Calculate bar width as percentage
                          const barWidth = stats.max > stats.min
                            ? ((subScore?.score ?? 0) - stats.min) / (stats.max - stats.min) * 100
                            : 50;
                          const medianPercent = stats.max > stats.min
                            ? (stats.median - stats.min) / (stats.max - stats.min) * 100
                            : 50;

                          return (
                            <div key={sub.id} className="border-l-4 pl-4" style={{ borderColor: color }}>
                              <h4 className="font-semibold text-gray-800">{sub.name}</h4>
                              <div className="mt-2 relative">
                                <div className="h-6 bg-gray-200 rounded relative">
                                  {/* Median line */}
                                  <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                                    style={{ left: `${medianPercent}%` }}
                                  />
                                  {/* Score bar */}
                                  <div
                                    className="h-full rounded flex items-center justify-end pr-2"
                                    style={{
                                      width: `${Math.max(barWidth, 5)}%`,
                                      backgroundColor: color
                                    }}
                                  >
                                    <span className="text-white text-sm font-bold">
                                      {subScore?.score?.toFixed(1) ?? '-'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{stats.min.toFixed(0)}</span>
                                  <span className="text-gray-400">Median</span>
                                  <span>{stats.max.toFixed(0)}</span>
                                </div>
                              </div>

                              {/* Indicators - indented under subcomponent */}
                              {subIndicators.length > 0 && (
                                <div className="ml-4 mt-3 pl-3 border-l-2 border-gray-200 space-y-3">
                                  {subIndicators.map(indicator => {
                                    const indScore = subScore?.indicators?.[indicator.id];
                                    // Generate consistent values for display
                                    const hashCode = indicator.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                                    const indValue = indScore?.score ?? (Math.abs(hashCode % 80) + 10);
                                    const indBarWidth = (indValue / 100) * 100;
                                    const indMedian = 45 + Math.abs((hashCode >> 4) % 20);
                                    const indMedianPercent = indMedian;

                                    // Convert rgb to rgba for lighter color
                                    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                                    const indicatorColor = match
                                      ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.8)`
                                      : color;

                                    return (
                                      <div key={indicator.id}>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs text-gray-600">{indicator.name}</span>
                                          <span className="text-gray-400 text-[10px] rounded-full border border-gray-300 w-3 h-3 flex items-center justify-center cursor-help">?</span>
                                        </div>
                                        <div className="relative">
                                          <div className="h-4 bg-gray-200 rounded relative">
                                            {/* Median line */}
                                            <div
                                              className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                                              style={{ left: `${indMedianPercent}%` }}
                                            />
                                            {/* Score bar */}
                                            <div
                                              className="h-full rounded flex items-center justify-end pr-1"
                                              style={{
                                                width: `${Math.max(indBarWidth, 5)}%`,
                                                backgroundColor: indicatorColor
                                              }}
                                            >
                                              <span className="text-white text-xs font-semibold">
                                                {indValue.toFixed(1)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Separator between components in same group */}
                {components.indexOf(component) < components.length - 1 && (
                  <hr className="my-6 border-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
