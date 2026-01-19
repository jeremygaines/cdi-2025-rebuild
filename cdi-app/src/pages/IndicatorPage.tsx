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

export function IndicatorPage() {
  const { componentId, subcomponentId, indicatorId } = useParams<{
    componentId: string;
    subcomponentId: string;
    indicatorId: string;
  }>();
  const { loading, error, getComponent, getSubcomponent, getIndicator, components, subcomponents, indicators, countries } = useData();
  const { showAdjusted } = useFilters();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const component = getComponent(componentId ?? '');
  const subcomponent = getSubcomponent(subcomponentId ?? '');
  const indicator = getIndicator(indicatorId ?? '');
  const componentColor = component ? COMPONENT_COLORS[component.id] || component.color : '#888';
  const headerColor = component ? HEADER_COLORS[component.id] || componentColor : '#666';

  // Get all subcomponents for this component
  const componentSubcomponents = useMemo(() => {
    if (!component) return [];
    return subcomponents.filter(s => s.componentId === component.id);
  }, [subcomponents, component]);

  // Get all indicators for this subcomponent
  const subcomponentIndicators = useMemo(() => {
    if (!subcomponent) return [];
    return indicators.filter(i => i.subcomponentId === subcomponent.id);
  }, [indicators, subcomponent]);

  // Sort countries by indicator score
  const sortedCountries = useMemo(() => {
    if (!indicator || !component || !subcomponent) return [];

    return [...countries].sort((a, b) => {
      const aComp = a.components[component.id];
      const bComp = b.components[component.id];
      const aSubScore = aComp?.subcomponents?.[subcomponent.id];
      const bSubScore = bComp?.subcomponents?.[subcomponent.id];
      const aIndScore = aSubScore?.indicators?.[indicator.id];
      const bIndScore = bSubScore?.indicators?.[indicator.id];
      const aRank = aIndScore?.rank ?? 999;
      const bRank = bIndScore?.rank ?? 999;
      return aRank - bRank;
    });
  }, [countries, component, subcomponent, indicator]);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  if (!component || !subcomponent || !indicator) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Indicator not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  // Get previous and next indicators for navigation
  const currentIndIndex = subcomponentIndicators.findIndex(i => i.id === indicatorId);
  const prevIndicator = currentIndIndex > 0 ? subcomponentIndicators[currentIndIndex - 1] : null;
  const nextIndicator = currentIndIndex < subcomponentIndicators.length - 1 ? subcomponentIndicators[currentIndIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar - Go back link */}
      <div className="bg-[rgb(245,243,238)] border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link to={`/component/${component.id}/${subcomponent.id}`} className="text-cdi-primary hover:underline flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            GO BACK TO {subcomponent.name.toUpperCase()} PAGE
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
                {indicator.name}
              </h1>
              {indicator.unit && (
                <p className="text-sm text-gray-500 mb-4">
                  Unit: <span className="font-medium text-cdi-primary">{indicator.unit}</span>
                  {indicator.lowerIsBetter && (
                    <span className="ml-3 text-xs bg-gray-100 px-2 py-1 rounded">Lower is better</span>
                  )}
                </p>
              )}

              {indicator.description && (
                <div
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: indicator.description
                      .split('\n\n')
                      .map(para => `<p>${para}</p>`)
                      .join('')
                  }}
                />
              )}

              <p className="mt-6 text-gray-600">
                Part of <Link
                  to={`/component/${component.id}/${subcomponent.id}`}
                  className="font-semibold hover:underline"
                  style={{ color: componentColor }}
                >
                  {subcomponent.name}
                </Link> in <Link
                  to={`/component/${component.id}`}
                  className="font-semibold hover:underline"
                  style={{ color: componentColor }}
                >
                  {component.name}
                </Link>.
              </p>
            </div>

            {/* Right column - Indicators list */}
            <div className="lg:w-1/2 lg:pl-8">
              <div
                className="p-3"
                style={{ borderBottom: `5px solid ${componentColor}` }}
              >
                <h5
                  className="font-bold uppercase m-0"
                  style={{ color: componentColor }}
                >
                  {subcomponent.name}
                </h5>
                <p className="text-xs text-gray-500 mt-1">Indicators</p>
              </div>

              <div className="mt-2">
                {subcomponentIndicators.map(ind => {
                  const isActive = ind.id === indicator.id;
                  return (
                    <div key={ind.id} className="border-b border-gray-200">
                      <Link
                        to={`/component/${component.id}/${subcomponent.id}/${ind.id}`}
                        className="block p-3 hover:bg-gray-50 transition-colors"
                        style={{
                          backgroundColor: isActive ? `${componentColor}20` : 'transparent'
                        }}
                      >
                        <h5
                          className={`hover:underline ${isActive ? 'font-bold' : 'font-semibold'}`}
                          style={{ color: componentColor }}
                        >
                          {ind.name}
                          {isActive && <span className="ml-2 text-gray-400">›</span>}
                        </h5>
                        {ind.unit && (
                          <span className="text-xs text-gray-400">{ind.unit}</span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Link back to subcomponent */}
              <div className="mt-4">
                <Link
                  to={`/component/${component.id}/${subcomponent.id}`}
                  className="text-sm hover:underline flex items-center gap-1"
                  style={{ color: componentColor }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to {subcomponent.name}
                </Link>
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
                  {indicator.name}
                </th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => {
                const compScore = country.components[component.id];
                const subScore = compScore?.subcomponents?.[subcomponent.id];
                const indScore = subScore?.indicators?.[indicator.id];
                const displayScore = indScore?.score ?? 0;
                const displayRank = indScore?.rank ?? index + 1;
                const hasMissingData = indScore?.missingData ?? false;
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
                      {hasMissingData && (
                        <span className="ml-2 text-xs text-gray-400" title="Missing data">*</span>
                      )}
                    </td>

                    {/* Score cell */}
                    <td className="px-5 py-4" style={{ background: scoreBg }}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm" style={{ color: '#5e6666' }}>
                          {hasMissingData ? 'N/A' : `${percentage}%`}
                        </span>
                        <div className="w-full h-2.5 bg-gray-200 rounded-sm overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: hasMissingData ? '0%' : `${percentage}%`,
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
            indicator={indicator}
            componentColor={componentColor}
            headerColor={headerColor}
            indicators={subcomponentIndicators}
            countries={countries}
            showAdjusted={showAdjusted}
            prevIndicator={prevIndicator}
            nextIndicator={nextIndicator}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center pt-6 border-t">
          {prevIndicator ? (
            <Link
              to={`/component/${component.id}/${subcomponent.id}/${prevIndicator.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {prevIndicator.name}
            </Link>
          ) : (
            <div />
          )}
          <Link to={`/component/${component.id}/${subcomponent.id}`} className="text-cdi-primary hover:underline">
            Back to {subcomponent.name}
          </Link>
          {nextIndicator ? (
            <Link
              to={`/component/${component.id}/${subcomponent.id}/${nextIndicator.id}`}
              className="text-cdi-primary hover:underline flex items-center gap-2"
            >
              {nextIndicator.name}
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
  indicator: Indicator;
  componentColor: string;
  headerColor: string;
  indicators: Indicator[];
  countries: Country[];
  showAdjusted: boolean;
  prevIndicator: Indicator | null;
  nextIndicator: Indicator | null;
  onClose: () => void;
}

function DetailsDrawer({
  country,
  component,
  subcomponent,
  indicator,
  componentColor,
  headerColor,
  indicators,
  countries,
  showAdjusted,
  prevIndicator,
  nextIndicator,
  onClose,
}: DetailsDrawerProps) {
  const compScore = country.components[component.id];
  const subScore = compScore?.subcomponents?.[subcomponent.id];
  const indScore = subScore?.indicators?.[indicator.id];
  const displayScore = indScore?.score ?? 0;
  const displayRank = indScore?.rank ?? 0;
  const hasMissingData = indScore?.missingData ?? false;
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

            {/* Indicator Score Card - Overlapping on right */}
            <div className="flex-shrink-0 shadow-lg">
              <div
                className="text-white text-center py-1.5 px-6 text-sm font-medium"
                style={{ backgroundColor: headerColor }}
              >
                {indicator.name}
              </div>
              <div
                className="text-white px-6 py-4"
                style={{ backgroundColor: componentColor }}
              >
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-xs opacity-70">Rank</div>
                    <div className="text-4xl font-bold">
                      {hasMissingData ? 'N/A' : (
                        <>
                          {displayRank}
                          <sup className="text-sm ml-0.5">{getOrdinalSuffix(displayRank)}</sup>
                        </>
                      )}
                    </div>
                    <div className="text-xs opacity-70">of {countries.length}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs opacity-70">Score</div>
                    <div className="text-4xl font-bold">
                      {hasMissingData ? 'N/A' : `${Math.round(displayScore)}%`}
                    </div>
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
          {indicator.name}
        </h3>

        {indicator.unit && (
          <p className="text-sm text-gray-500 mb-4">
            Unit: <span className="font-medium text-cdi-primary">{indicator.unit}</span>
            {indicator.lowerIsBetter && (
              <span className="ml-3 text-xs bg-gray-100 px-2 py-1 rounded">Lower is better</span>
            )}
          </p>
        )}

        {indicator.description && (
          <div className="text-gray-600 mb-8 leading-relaxed">
            <div
              className="space-y-4"
              dangerouslySetInnerHTML={{
                __html: indicator.description
                  .split('\n\n')
                  .map(para => `<p>${para}</p>`)
                  .join('')
              }}
            />
          </div>
        )}

        <p className="text-gray-600 mb-8">
          Part of <Link
            to={`/component/${component.id}/${subcomponent.id}`}
            className="font-semibold hover:underline"
            style={{ color: componentColor }}
            onClick={onClose}
          >
            {subcomponent.name}
          </Link>
        </p>

        {/* Other indicators in this subcomponent */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-light text-gray-700 mb-4">
            Other indicators in {subcomponent.name}:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {indicators.filter(i => i.id !== indicator.id).map(ind => (
              <Link
                key={ind.id}
                to={`/component/${component.id}/${subcomponent.id}/${ind.id}`}
                className="p-3 border border-gray-200 hover:border-gray-400 transition-colors text-sm"
                style={{ color: componentColor }}
                onClick={onClose}
              >
                {ind.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 mt-8">
          {prevIndicator ? (
            <Link
              to={`/component/${component.id}/${subcomponent.id}/${prevIndicator.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <svg className="w-5 h-5 text-cdi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Prev</div>
                <div className="text-cdi-primary uppercase font-medium">{prevIndicator.name}</div>
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

          {nextIndicator ? (
            <Link
              to={`/component/${component.id}/${subcomponent.id}/${nextIndicator.id}`}
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Next</div>
                <div className="text-cdi-primary uppercase font-medium">{nextIndicator.name}</div>
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
