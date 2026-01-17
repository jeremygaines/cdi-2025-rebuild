import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';
import type { Country, Component, Subcomponent, Indicator } from '@/types';

// Component colors
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

// Darker header colors
const HEADER_COLORS: Record<string, string> = {
  'development-finance': 'rgb(133, 87, 158)',
  'investment': 'rgb(41, 187, 255)',
  'migration': 'rgb(0, 110, 182)',
  'trade': 'rgb(20, 60, 160)',
  'environment': 'rgb(230, 174, 30)',
  'health': 'rgb(230, 140, 50)',
  'security': 'rgb(220, 90, 0)',
  'technology': 'rgb(180, 75, 0)',
};

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Get background color with opacity for alternating rows
function getRowBgColor(baseColor: string, isEven: boolean): string {
  const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'transparent';
  const [, r, g, b] = match;
  const opacity = isEven ? 0.2 : 0.098;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const ROW_BASE_COLOR = 'rgb(153, 129, 92)';

export function ComponentPage() {
  const { componentId } = useParams<{ componentId: string }>();
  const { loading, error, getComponent, components, countries, subcomponents, indicators } = useData();
  const { showAdjusted } = useFilters();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const component = getComponent(componentId ?? '');
  const componentColor = component ? COMPONENT_COLORS[component.id] || component.color : '#888';
  const headerColor = component ? HEADER_COLORS[component.id] || componentColor : '#666';

  // Sort countries by component score
  const sortedCountries = useMemo(() => {
    if (!component) return [];
    return [...countries].sort((a, b) => {
      const aComp = a.components[component.id];
      const bComp = b.components[component.id];
      const aRank = showAdjusted ? aComp?.rankAdjusted : aComp?.rank;
      const bRank = showAdjusted ? bComp?.rankAdjusted : bComp?.rank;
      return (aRank ?? 999) - (bRank ?? 999);
    });
  }, [countries, component, showAdjusted]);

  // Get subcomponents for this component
  const componentSubcomponents = useMemo(() => {
    if (!component) return [];
    return subcomponents.filter(s => s.componentId === component.id);
  }, [subcomponents, component]);

  // Get indicators for this component, grouped by subcomponent
  const componentIndicators = useMemo(() => {
    if (!component) return [];
    return indicators.filter(i => i.componentId === component.id);
  }, [indicators, component]);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  if (!component) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Component not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  // Get previous and next components for navigation
  const currentIndex = components.findIndex(c => c.id === componentId);
  const prevComponent = currentIndex > 0 ? components[currentIndex - 1] : null;
  const nextComponent = currentIndex < components.length - 1 ? components[currentIndex + 1] : null;

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

      {/* Component tabs row */}
      <div className="border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {components.map(comp => {
              const isActive = comp.id === component.id;
              const color = COMPONENT_COLORS[comp.id] || comp.color;
              return (
                <Link
                  key={comp.id}
                  to={`/component/${comp.id}`}
                  className="flex-1 p-3 text-center hover:bg-gray-50 transition-colors min-w-[100px]"
                  style={{
                    borderBottom: `3px solid ${color}`,
                    backgroundColor: isActive ? color : 'transparent',
                    color: isActive ? 'white' : color,
                  }}
                >
                  <div className="font-semibold text-sm">{comp.shortName}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Description */}
            <div className="lg:w-1/2">
              {component.description && (
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: component.description
                      .split('\n\n')
                      .map(para => `<p>${para}</p>`)
                      .join('')
                  }}
                />
              )}
            </div>

            {/* Right column - Subcomponents list */}
            <div className="lg:w-1/2 lg:pl-8">
              <div
                className="p-3"
                style={{ borderBottom: `5px solid ${componentColor}` }}
              >
                <h5
                  className="font-bold uppercase m-0"
                  style={{ color: componentColor }}
                >
                  {component.name}
                </h5>
              </div>

              <div className="mt-2">
                {componentSubcomponents.map(subcomp => (
                  <div key={subcomp.id} className="border-b border-gray-200">
                    <Link
                      to={`/component/${component.id}/${subcomp.id}`}
                      className="block p-3 hover:bg-gray-50 transition-colors"
                    >
                      <h5
                        className="font-semibold hover:underline"
                        style={{ color: componentColor }}
                      >
                        {subcomp.name}
                      </h5>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings table */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-20">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-48">
                  Country
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold uppercase"
                  style={{ color: componentColor, borderBottom: `3px solid ${componentColor}` }}
                >
                  {component.name}
                </th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => {
                const compScore = country.components[component.id];
                const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
                const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;
                const percentage = Math.round(displayScore ?? 0);
                const isEven = index % 2 === 1;
                const isSelected = selectedCountry?.id === country.id;

                const firstColsBg = isSelected
                  ? componentColor
                  : getRowBgColor(ROW_BASE_COLOR, isEven);
                const scoreBg = isSelected
                  ? `${componentColor}30`
                  : getRowBgColor(componentColor, isEven);

                return (
                  <tr key={country.id} className="border-b border-gray-200">
                    {/* Rank cell */}
                    <td
                      className="px-4 py-4"
                      style={{
                        background: firstColsBg,
                        color: isSelected ? 'white' : undefined,
                      }}
                    >
                      <span className="bg-white px-3 py-1 rounded-full font-bold text-lg" style={{ color: 'rgb(0, 105, 112)' }}>
                        {displayRank}
                      </span>
                    </td>

                    {/* Country cell */}
                    <td
                      className="px-4 py-4 font-medium"
                      style={{
                        background: firstColsBg,
                        color: isSelected ? 'white' : '#73706f',
                      }}
                    >
                      {country.name}
                    </td>

                    {/* Score cell */}
                    <td className="px-5 py-4" style={{ background: scoreBg }}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm" style={{ color: '#5e6666' }}>
                          {percentage}%
                        </span>
                        <div className="w-full h-2.5 bg-gray-200 rounded-sm overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: componentColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* View Details cell */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedCountry(isSelected ? null : country)}
                        className="text-cdi-primary hover:underline text-sm flex items-center gap-1"
                      >
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Details Drawer */}
        {selectedCountry && (
          <DetailsDrawer
            country={selectedCountry}
            component={component}
            componentColor={componentColor}
            headerColor={headerColor}
            subcomponents={componentSubcomponents}
            indicators={componentIndicators}
            countries={countries}
            showAdjusted={showAdjusted}
            prevComponent={prevComponent}
            nextComponent={nextComponent}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center pt-6 border-t">
          {prevComponent ? (
            <Link
              to={`/component/${prevComponent.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {prevComponent.name}
            </Link>
          ) : (
            <div />
          )}
          <Link to="/" className="text-cdi-primary hover:underline">
            Back to Main Rankings
          </Link>
          {nextComponent ? (
            <Link
              to={`/component/${nextComponent.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              {nextComponent.name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}

interface DetailsDrawerProps {
  country: Country;
  component: Component;
  componentColor: string;
  headerColor: string;
  subcomponents: Subcomponent[];
  indicators: Indicator[];
  countries: Country[];
  showAdjusted: boolean;
  prevComponent: Component | null;
  nextComponent: Component | null;
  onClose: () => void;
}

function DetailsDrawer({
  country,
  component,
  componentColor,
  headerColor,
  subcomponents,
  indicators,
  countries,
  showAdjusted,
  prevComponent,
  nextComponent,
  onClose,
}: DetailsDrawerProps) {
  const compScore = country.components[component.id];
  const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
  const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;
  const overallRank = showAdjusted ? country.rankAdjusted : country.rank;
  const overallScore = showAdjusted ? country.scoreAdjusted : country.score;

  return (
    <div
      className="fixed right-0 top-0 h-full bg-white shadow-xl z-50 overflow-y-auto"
      style={{ width: '75%', maxWidth: '900px' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b">
        {/* Beige bar with country info */}
        <div className="relative" style={{ backgroundColor: '#f0ece7' }}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Country Info - Left */}
            <div className="flex-1 pr-4">
              <h2 className="text-3xl font-light text-gray-800">{country.name}</h2>
              <div className="text-gray-400 text-sm mt-1">
                Overall Rank: {overallRank}{getOrdinalSuffix(overallRank)} / Overall Score: {overallScore.toFixed(4)}%
              </div>
            </div>

            {/* Component Score Card - Overlapping on right */}
            <div className="flex-shrink-0 shadow-lg">
              <div
                className="text-white text-center py-1.5 px-6 text-sm font-medium"
                style={{ backgroundColor: headerColor }}
              >
                {component.name}
              </div>
              <div
                className="text-white px-6 py-4"
                style={{ backgroundColor: componentColor }}
              >
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-xs opacity-70">Rank</div>
                    <div className="text-4xl font-bold">
                      {displayRank}
                      <sup className="text-sm ml-0.5">{getOrdinalSuffix(displayRank ?? 0)}</sup>
                    </div>
                    <div className="text-xs opacity-70">of {countries.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs opacity-70">Score</div>
                    <div className="text-4xl font-bold">{Math.round(displayScore ?? 0)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions bar - below beige section */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-white">
          <Link
            to={`/country/${country.id}`}
            className="border border-cdi-primary text-cdi-primary px-4 py-2 text-sm uppercase tracking-wide hover:bg-cdi-primary hover:text-white transition-colors"
          >
            View Country Report
          </Link>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-light text-gray-800 mb-4">
          {component.name}
        </h3>

        <div className="text-gray-600 mb-8 leading-relaxed">
          {component.description && (
            <div
              className="space-y-4"
              dangerouslySetInnerHTML={{
                __html: component.description
                  .split('\n\n')
                  .map(para => `<p>${para}</p>`)
                  .join('')
              }}
            />
          )}
        </div>

        {/* Subcomponents with bars */}
        {subcomponents.map(subcomp => {
          // Generate consistent random values based on subcomponent id
          const hashCode = subcomp.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
          const baseValue = Math.abs(hashCode % 100);
          const value = baseValue + (Math.abs((hashCode >> 8) % 20) - 10);
          const median = 45 + Math.abs((hashCode >> 4) % 20);

          // Get indicators that belong to this subcomponent
          const subcompIndicators = indicators.filter(ind => ind.subcomponentId === subcomp.id);

          return (
            <div key={subcomp.id} className="mb-8">
              <h4 className="text-xl font-light text-gray-800 mb-4 flex items-center gap-2">
                {subcomp.name}
                <span className="text-gray-400 text-xs rounded-full border border-gray-300 w-4 h-4 flex items-center justify-center cursor-help">?</span>
              </h4>

              {/* Subcomponent bar */}
              <IndicatorBar
                name={subcomp.name}
                unit="score"
                color={componentColor}
                value={Math.max(0, Math.min(100, value))}
                min={0}
                max={100}
                median={median}
              />

              {/* Indicators - indented under the subcomponent */}
              {subcompIndicators.length > 0 && (
                <div className="ml-6 mt-4 pl-4 border-l-2 border-gray-200">
                  {subcompIndicators.map(indicator => {
                    // Generate consistent values for each indicator
                    const indHashCode = indicator.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
                    const indBaseValue = Math.abs(indHashCode % 100);
                    const indValue = indBaseValue + (Math.abs((indHashCode >> 8) % 20) - 10);
                    const indMedian = 45 + Math.abs((indHashCode >> 4) % 20);

                    return (
                      <div key={indicator.id} className="mb-4">
                        <IndicatorBar
                          name={indicator.name}
                          unit={indicator.unit}
                          color={componentColor}
                          value={Math.max(0, Math.min(100, indValue))}
                          min={0}
                          max={100}
                          median={indMedian}
                          isIndented
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 mt-8">
          {prevComponent ? (
            <Link
              to={`/component/${prevComponent.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <svg className="w-5 h-5 text-cdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Prev</div>
                <div className="text-cdi-primary uppercase font-medium">{prevComponent.name}</div>
              </div>
            </Link>
          ) : (
            <div className="w-32" />
          )}

          <Link
            to={`/country/${country.id}`}
            className="bg-cdi-primary text-white px-8 py-3 uppercase text-sm tracking-wide hover:opacity-90"
            onClick={onClose}
          >
            Go to Country Report
          </Link>

          {nextComponent ? (
            <Link
              to={`/component/${nextComponent.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Next</div>
                <div className="text-cdi-primary uppercase font-medium">{nextComponent.name}</div>
              </div>
              <svg className="w-5 h-5 text-cdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="w-32" />
          )}
        </div>
      </div>
    </div>
  );
}

interface IndicatorBarProps {
  name: string;
  unit?: string;
  color: string;
  value: number;
  min: number;
  max: number;
  median: number;
  isIndented?: boolean;
}

function IndicatorBar({ name, unit, color, value, min, max, median, isIndented = false }: IndicatorBarProps) {
  const range = max - min;
  const valuePercent = range > 0 ? ((value - min) / range) * 100 : 0;
  const medianPercent = range > 0 ? ((median - min) / range) * 100 : 50;

  // Format number based on size
  const formatNumber = (n: number) => {
    if (n === 0) return '0';
    if (Math.abs(n) < 0.01) return n.toExponential(2);
    if (Math.abs(n) < 1) return n.toFixed(6);
    if (Math.abs(n) < 100) return n.toFixed(4);
    return n.toFixed(2);
  };

  // Convert rgb to rgba for indented indicators (80% opacity)
  const getBarColor = () => {
    if (!isIndented) return color;
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.8)`;
    }
    return color;
  };
  const barColor = getBarColor();

  return (
    <div>
      {/* Header row: name with ?, then unit */}
      <div className="flex items-center gap-2 mb-1">
        <span className={isIndented ? "text-xs text-gray-600" : "text-sm text-gray-700"}>
          {name}
        </span>
        <span className="text-gray-400 text-[10px] rounded-full border border-gray-300 w-3.5 h-3.5 flex items-center justify-center cursor-help">?</span>
        {unit && (
          <span className="text-xs text-gray-400">
            / Indicator Unit: <span className="text-cdi-primary font-medium">{unit}</span>
          </span>
        )}
      </div>

      {/* Value displayed above bar on right */}
      <div className="flex justify-end mb-1">
        <span className={isIndented ? "text-lg font-semibold text-gray-600" : "text-xl font-semibold text-gray-700"}>
          {formatNumber(value)}
        </span>
      </div>

      {/* Progress bar */}
      <div className={isIndented ? "relative mb-4" : "relative mb-6"}>
        <div className={isIndented ? "h-2 bg-gray-200 relative" : "h-3 bg-gray-200 relative"}>
          {/* Value bar */}
          <div
            className="h-full"
            style={{
              width: `${Math.min(valuePercent, 100)}%`,
              backgroundColor: barColor,
            }}
          />
          {/* Median marker - vertical line */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${medianPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-px h-full bg-gray-600" />
            <div className="absolute top-full mt-1 text-xs text-gray-400 whitespace-nowrap">
              Median
            </div>
          </div>
        </div>

        {/* Min/Max labels below bar */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatNumber(min)}</span>
          <span>{formatNumber(max)}</span>
        </div>
      </div>
    </div>
  );
}
