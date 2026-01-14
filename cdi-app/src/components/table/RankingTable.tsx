import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { DetailDrawer } from '@/components/drawer/DetailDrawer';
import type { Country, Component } from '@/types';

type SortField = 'rank' | 'score' | string;
type SortDirection = 'asc' | 'desc';

// Component group definitions - colors from live site
const COMPONENT_GROUPS = {
  finance: { name: 'Development Finance', color: 'rgb(146, 101, 171)' },
  exchange: { name: 'Exchange', color: 'rgb(68, 195, 255)' },
  global: { name: 'Global Public Goods', color: 'rgb(255, 193, 39)' }
};

// Row background base color (tan/brown for first columns)
const ROW_BASE_COLOR = 'rgb(153, 129, 92)';

// Get background color with opacity for alternating rows
function getRowBgColor(baseColor: string, isEven: boolean): string {
  // Extract RGB values
  const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'transparent';
  const [, r, g, b] = match;
  const opacity = isEven ? 0.2 : 0.098;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Get group color for a component
function getGroupColor(group: string): string {
  return COMPONENT_GROUPS[group as keyof typeof COMPONENT_GROUPS]?.color || ROW_BASE_COLOR;
}

export function RankingTable() {
  const { countries, components, countryGroups } = useData();
  const { selectedGroupId, showAdjusted } = useFilters();
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const filteredCountries = useMemo(() => {
    if (selectedGroupId === 'all') return countries;
    const group = countryGroups.find(g => g.id === selectedGroupId);
    if (!group) return countries;
    return countries.filter(c => group.countryIds.includes(c.id));
  }, [countries, countryGroups, selectedGroupId]);

  const sortedCountries = useMemo(() => {
    return [...filteredCountries].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (sortField === 'rank') {
        aValue = showAdjusted ? a.rankAdjusted : a.rank;
        bValue = showAdjusted ? b.rankAdjusted : b.rank;
      } else if (sortField === 'score') {
        aValue = showAdjusted ? a.scoreAdjusted : a.score;
        bValue = showAdjusted ? b.scoreAdjusted : b.score;
      } else {
        const aComp = a.components[sortField];
        const bComp = b.components[sortField];
        aValue = showAdjusted ? (aComp?.scoreAdjusted ?? 0) : (aComp?.score ?? 0);
        bValue = showAdjusted ? (bComp?.scoreAdjusted ?? 0) : (bComp?.score ?? 0);
      }

      const diff = aValue - bValue;
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [filteredCountries, sortField, sortDirection, showAdjusted]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleCellClick = (country: Country, componentId: string) => {
    setSelectedCountry(country);
    setSelectedComponentId(componentId);
  };

  const handleCloseDrawer = () => {
    setSelectedCountry(null);
    setSelectedComponentId(null);
  };

  // Group components by their group
  const financeComponents = components.filter(c => c.group === 'finance');
  const exchangeComponents = components.filter(c => c.group === 'exchange');
  const globalComponents = components.filter(c => c.group === 'global');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Group headers row */}
          <thead>
            <tr>
              <th colSpan={3} className="bg-white"></th>
              {/* Development Finance group */}
              <th
                colSpan={financeComponents.length}
                className="text-center py-2 text-xs"
              >
                <span style={{ color: COMPONENT_GROUPS.finance.color }} className="flex items-center justify-center gap-1">
                  {COMPONENT_GROUPS.finance.name}
                  <InfoIcon color={COMPONENT_GROUPS.finance.color} />
                </span>
              </th>
              {/* Exchange group */}
              <th
                colSpan={exchangeComponents.length}
                className="text-center py-2 text-xs"
              >
                <span style={{ color: COMPONENT_GROUPS.exchange.color }} className="flex items-center justify-center gap-1">
                  {COMPONENT_GROUPS.exchange.name}
                  <InfoIcon color={COMPONENT_GROUPS.exchange.color} />
                </span>
              </th>
              {/* Global Public Goods group */}
              <th
                colSpan={globalComponents.length}
                className="text-center py-2 text-xs"
              >
                <span style={{ color: COMPONENT_GROUPS.global.color }} className="flex items-center justify-center gap-1">
                  {COMPONENT_GROUPS.global.name}
                  <InfoIcon color={COMPONENT_GROUPS.global.color} />
                </span>
              </th>
            </tr>

            {/* Column headers row */}
            <tr>
              <th
                className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-50 w-16"
                onClick={() => handleSort('rank')}
              >
                Rank
                {sortField === 'rank' && (
                  <span className="ml-1" style={{ color: 'rgb(0, 105, 112)' }}>{sortDirection === 'asc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th
                className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-50 w-16"
                onClick={() => handleSort('score')}
              >
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-32">
                Overall
              </th>
              {components.map(component => (
                <th
                  key={component.id}
                  className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-80 min-w-[100px]"
                  style={{
                    color: component.color,
                    borderBottom: `3px solid ${component.color}`
                  }}
                  onClick={() => handleSort(component.id)}
                >
                  <Link
                    to={`/component/${component.id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {component.shortName}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedCountries.map((country, index) => (
              <CountryRow
                key={country.id}
                country={country}
                components={components}
                showAdjusted={showAdjusted}
                isEven={index % 2 === 1}
                onCellClick={handleCellClick}
                isSelected={selectedCountry?.id === country.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sortedCountries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No countries found for the selected filter.
        </div>
      )}

      <DetailDrawer
        isOpen={selectedCountry !== null}
        onClose={handleCloseDrawer}
        country={selectedCountry}
        componentId={selectedComponentId}
      />
    </div>
  );
}

interface CountryRowProps {
  country: Country;
  components: Component[];
  showAdjusted: boolean;
  isEven: boolean;
  onCellClick: (country: Country, componentId: string) => void;
  isSelected: boolean;
}

function CountryRow({ country, components, showAdjusted, isEven, onCellClick, isSelected }: CountryRowProps) {
  const rank = showAdjusted ? country.rankAdjusted : country.rank;
  const score = showAdjusted ? country.scoreAdjusted : country.score;

  // First columns background (tan/brown)
  const firstColsBg = isSelected ? 'rgb(200, 220, 255)' : getRowBgColor(ROW_BASE_COLOR, isEven);

  return (
    <tr className="border-b border-gray-200 hover:brightness-95 transition-all">
      {/* Rank cell with teal color and left bar */}
      <td
        className="py-4 relative"
        style={{ background: firstColsBg }}
      >
        <div className="flex items-center">
          <div
            className="w-1 h-8 absolute left-0"
            style={{ background: 'rgb(0, 105, 112)' }}
          ></div>
          <span
            className="font-bold text-lg pl-4"
            style={{ color: 'rgb(0, 105, 112)' }}
          >
            {rank}
          </span>
        </div>
      </td>

      {/* Score cell */}
      <td
        className="px-2 py-4"
        style={{ background: firstColsBg }}
      >
        <span className="text-gray-700 font-medium">
          {Math.round(score)}
        </span>
      </td>

      {/* Country name (Overall column) */}
      <td
        className="px-4 py-4"
        style={{ background: firstColsBg }}
      >
        <Link
          to={`/country/${country.id}`}
          className="text-gray-800 hover:underline font-medium"
          style={{ color: 'rgb(0, 105, 112)' }}
        >
          {country.name}
        </Link>
      </td>

      {/* Component cells */}
      {components.map(component => {
        const compScore = country.components[component.id];
        const displayScore = showAdjusted
          ? compScore?.scoreAdjusted
          : compScore?.score;
        const percentage = Math.round(displayScore ?? 0);

        // Cell background uses the component's GROUP color
        const groupColor = getGroupColor(component.group);
        const cellBg = isSelected ? 'rgb(200, 220, 255)' : getRowBgColor(groupColor, isEven);

        return (
          <td
            key={component.id}
            className="px-2 py-3 cursor-pointer hover:brightness-90 transition-all"
            style={{ background: cellBg }}
            onClick={() => onCellClick(country, component.id)}
          >
            <div className="flex flex-col items-center gap-1">
              {/* Percentage value */}
              <span className="text-sm text-gray-700">
                {percentage}%
              </span>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-sm overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: component.color
                  }}
                />
              </div>
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function InfoIcon({ color }: { color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] cursor-help border"
      style={{ borderColor: color, color: color }}
      title="More information"
    >
      ?
    </span>
  );
}
