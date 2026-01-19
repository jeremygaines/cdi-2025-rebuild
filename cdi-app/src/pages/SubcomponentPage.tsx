import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';
import type { Country, Component, Subcomponent, Indicator } from '@/types';

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

export function SubcomponentPage() {
  const { componentId, subcomponentId } = useParams<{
    componentId: string;
    subcomponentId: string;
  }>();
  const { loading, error, getComponent, components, subcomponents, indicators, countries } = useData();
  const { showAdjusted } = useFilters();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [expandedSubcomponents, setExpandedSubcomponents] = useState<Set<string>>(new Set());

  const component = getComponent(componentId ?? '');
  const subcomponent = subcomponents.find(s => s.id === subcomponentId);
  const componentColor = component ? COMPONENT_COLORS[component.id] || component.color : '#888';
  const headerColor = component ? HEADER_COLORS[component.id] || componentColor : '#666';

  // Get all subcomponents for this component (for sidebar)
  const componentSubcomponents = useMemo(() => {
    if (!component) return [];
    return subcomponents.filter(s => s.componentId === component.id);
  }, [subcomponents, component]);

  // Get indicators grouped by subcomponent
  const indicatorsBySubcomponent = useMemo(() => {
    if (!component) return {};
    const componentIndicators = indicators.filter(i => i.componentId === component.id);
    const grouped: Record<string, Indicator[]> = {};
    for (const ind of componentIndicators) {
      if (ind.subcomponentId) {
        if (!grouped[ind.subcomponentId]) {
          grouped[ind.subcomponentId] = [];
        }
        grouped[ind.subcomponentId].push(ind);
      }
    }
    return grouped;
  }, [indicators, component]);

  const toggleSubcomponent = (subcompId: string) => {
    setExpandedSubcomponents(prev => {
      const next = new Set(prev);
      if (next.has(subcompId)) {
        next.delete(subcompId);
      } else {
        next.add(subcompId);
      }
      return next;
    });
  };

  // Sort countries by subcomponent score
  const sortedCountries = useMemo(() => {
    if (!subcomponent || !component) return [];

    return [...countries].sort((a, b) => {
      const aComp = a.components[component.id];
      const bComp = b.components[component.id];
      const aSubScore = aComp?.subcomponents?.[subcomponent.id];
      const bSubScore = bComp?.subcomponents?.[subcomponent.id];
      const aRank = aSubScore?.rank ?? 999;
      const bRank = bSubScore?.rank ?? 999;
      return aRank - bRank;
    });
  }, [countries, component, subcomponent]);

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

  // Get previous and next subcomponents for navigation
  const currentSubIndex = componentSubcomponents.findIndex(s => s.id === subcomponentId);
  const prevSubcomponent = currentSubIndex > 0 ? componentSubcomponents[currentSubIndex - 1] : null;
  const nextSubcomponent = currentSubIndex < componentSubcomponents.length - 1 ? componentSubcomponents[currentSubIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar - Go back link */}
      <div className="bg-[rgb(245,243,238)] border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to={`/component/${component.id}`} className="text-cdi-primary hover:underline flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            GO BACK TO {component.name.toUpperCase()} PAGE
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
              <h1 className="text-3xl font-light text-gray-800 mb-2">
                {subcomponent.name}
              </h1>
              {subcomponent.subtitle && (
                <p className="text-lg italic text-gray-500 mb-6">
                  {subcomponent.subtitle}
                </p>
              )}

              {subcomponent.description && (
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: subcomponent.description
                      .split('\n\n')
                      .map(para => `<p>${para}</p>`)
                      .join('')
                  }}
                />
              )}

              <p className="mt-6 text-gray-600">
                The weight of this indicator is <strong>{subcomponent.weight}</strong>.
              </p>
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
                {componentSubcomponents.map(subcomp => {
                  const isActive = subcomp.id === subcomponent.id;
                  const subcompIndicators = indicatorsBySubcomponent[subcomp.id] || [];
                  const isExpanded = expandedSubcomponents.has(subcomp.id) || isActive;
                  const hasIndicators = subcompIndicators.length > 0;

                  return (
                    <div key={subcomp.id} className="border-b border-gray-200">
                      <div
                        className="flex items-center"
                        style={{
                          backgroundColor: isActive ? `${componentColor}20` : 'transparent'
                        }}
                      >
                        {hasIndicators && (
                          <button
                            onClick={() => toggleSubcomponent(subcomp.id)}
                            className="p-3 hover:bg-gray-100 transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        <Link
                          to={`/component/${component.id}/${subcomp.id}`}
                          className={`flex-1 p-3 hover:bg-gray-50 transition-colors ${!hasIndicators ? 'pl-10' : 'pl-0'}`}
                        >
                          <h5
                            className={`hover:underline ${isActive ? 'font-bold' : 'font-semibold'}`}
                            style={{ color: componentColor }}
                          >
                            {subcomp.name}
                            {isActive && <span className="ml-2 text-gray-400">›</span>}
                          </h5>
                        </Link>
                      </div>

                      {/* Expandable indicators list */}
                      {isExpanded && hasIndicators && (
                        <div
                          className="pl-10 pb-2"
                          style={{
                            backgroundColor: isActive ? `${componentColor}10` : 'transparent'
                          }}
                        >
                          {subcompIndicators.map(ind => (
                            <Link
                              key={ind.id}
                              to={`/component/${component.id}/${subcomp.id}/${ind.id}`}
                              className="block py-1.5 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              {ind.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  {subcomponent.name}
                </th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => {
                const compScore = country.components[component.id];
                const subScore = compScore?.subcomponents?.[subcomponent.id];
                const displayScore = subScore?.score ?? 0;
                const displayRank = subScore?.rank ?? 999;
                const percentage = Math.round(displayScore);
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
            subcomponent={subcomponent}
            componentColor={componentColor}
            headerColor={headerColor}
            subcomponents={componentSubcomponents}
            countries={countries}
            showAdjusted={showAdjusted}
            prevSubcomponent={prevSubcomponent}
            nextSubcomponent={nextSubcomponent}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center pt-6 border-t">
          {prevSubcomponent ? (
            <Link
              to={`/component/${component.id}/${prevSubcomponent.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {prevSubcomponent.name}
            </Link>
          ) : (
            <div />
          )}
          <Link to={`/component/${component.id}`} className="text-cdi-primary hover:underline">
            Back to {component.name}
          </Link>
          {nextSubcomponent ? (
            <Link
              to={`/component/${component.id}/${nextSubcomponent.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              {nextSubcomponent.name}
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
  subcomponent: Subcomponent;
  componentColor: string;
  headerColor: string;
  subcomponents: Subcomponent[];
  countries: Country[];
  showAdjusted: boolean;
  prevSubcomponent: Subcomponent | null;
  nextSubcomponent: Subcomponent | null;
  onClose: () => void;
}

function DetailsDrawer({
  country,
  component,
  subcomponent,
  componentColor,
  headerColor,
  subcomponents,
  countries,
  showAdjusted,
  prevSubcomponent,
  nextSubcomponent,
  onClose,
}: DetailsDrawerProps) {
  const compScore = country.components[component.id];
  const subScore = compScore?.subcomponents?.[subcomponent.id];
  const displayScore = subScore?.score ?? 0;
  const displayRank = subScore?.rank ?? 999;
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

            {/* Subcomponent Score Card - Overlapping on right */}
            <div className="flex-shrink-0 shadow-lg">
              <div
                className="text-white text-center py-1.5 px-6 text-sm font-medium"
                style={{ backgroundColor: headerColor }}
              >
                {subcomponent.name}
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
                      <sup className="text-sm ml-0.5">{getOrdinalSuffix(displayRank)}</sup>
                    </div>
                    <div className="text-xs opacity-70">of {countries.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs opacity-70">Score</div>
                    <div className="text-4xl font-bold">{Math.round(displayScore)}%</div>
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
          {subcomponent.name}
        </h3>

        {subcomponent.description && (
          <div className="text-gray-600 mb-8 leading-relaxed">
            <div
              className="space-y-4"
              dangerouslySetInnerHTML={{
                __html: subcomponent.description
                  .split('\n\n')
                  .map(para => `<p>${para}</p>`)
                  .join('')
              }}
            />
          </div>
        )}

        <p className="text-gray-600 mb-8">
          Weight: <strong>{subcomponent.weight}</strong>
        </p>

        {/* Other subcomponents in this component */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-light text-gray-700 mb-4">
            Other indicators in {component.name}:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {subcomponents.filter(s => s.id !== subcomponent.id).map(subcomp => (
              <Link
                key={subcomp.id}
                to={`/component/${component.id}/${subcomp.id}`}
                className="p-3 border border-gray-200 hover:border-gray-400 transition-colors text-sm"
                style={{ color: componentColor }}
                onClick={onClose}
              >
                {subcomp.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 mt-8">
          {prevSubcomponent ? (
            <Link
              to={`/component/${component.id}/${prevSubcomponent.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <svg className="w-5 h-5 text-cdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Prev</div>
                <div className="text-cdi-primary uppercase font-medium">{prevSubcomponent.name}</div>
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

          {nextSubcomponent ? (
            <Link
              to={`/component/${component.id}/${nextSubcomponent.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Next</div>
                <div className="text-cdi-primary uppercase font-medium">{nextSubcomponent.name}</div>
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
