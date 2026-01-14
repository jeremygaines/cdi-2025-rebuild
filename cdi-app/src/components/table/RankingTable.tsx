import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { ScoreBar } from '@/components/visualization/ScoreBar';
import { DetailDrawer } from '@/components/drawer/DetailDrawer';
import type { Country, Component } from '@/types';

type SortField = 'rank' | 'score' | string; // string for component IDs
type SortDirection = 'asc' | 'desc';

export function RankingTable() {
  const { countries, components, countryGroups } = useData();
  const { selectedGroupId, showAdjusted } = useFilters();
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Drawer state
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Filter countries by selected group
  const filteredCountries = useMemo(() => {
    if (selectedGroupId === 'all') return countries;
    const group = countryGroups.find(g => g.id === selectedGroupId);
    if (!group) return countries;
    return countries.filter(c => group.countryIds.includes(c.id));
  }, [countries, countryGroups, selectedGroupId]);

  // Sort countries
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
        // Component sort
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

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleCellClick = (country: Country, componentId: string) => {
    setSelectedCountry(country);
    setSelectedComponentId(componentId);
  };

  const handleCloseDrawer = () => {
    setSelectedCountry(null);
    setSelectedComponentId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th
                className="px-3 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('rank')}
              >
                Rank{getSortIndicator('rank')}
              </th>
              <th
                className="px-3 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('score')}
              >
                Score{getSortIndicator('score')}
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                Country
              </th>
              {components.map(component => (
                <ComponentHeader
                  key={component.id}
                  component={component}
                  onSort={() => handleSort(component.id)}
                  sortIndicator={getSortIndicator(component.id)}
                />
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
                isEven={index % 2 === 0}
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

      {/* Detail drawer */}
      <DetailDrawer
        isOpen={selectedCountry !== null}
        onClose={handleCloseDrawer}
        country={selectedCountry}
        componentId={selectedComponentId}
      />
    </div>
  );
}

interface ComponentHeaderProps {
  component: Component;
  onSort: () => void;
  sortIndicator: string | null;
}

function ComponentHeader({ component, onSort, sortIndicator }: ComponentHeaderProps) {
  return (
    <th
      className="px-2 py-3 text-center text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity min-w-[80px]"
      style={{ backgroundColor: component.color, color: 'white' }}
      onClick={onSort}
    >
      <Link
        to={`/component/${component.id}`}
        className="hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {component.shortName}
      </Link>
      {sortIndicator}
    </th>
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
  const isTied = showAdjusted ? country.isTiedAdjusted : country.isTied;

  return (
    <tr className={`border-b ${isSelected ? 'bg-blue-100' : isEven ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
      <td className="px-3 py-3 text-sm font-medium">
        {rank}{isTied && <span className="text-gray-400">*</span>}
      </td>
      <td className="px-3 py-3 text-sm font-semibold">
        {score.toFixed(1)}
      </td>
      <td className="px-3 py-3">
        <Link
          to={`/country/${country.id}`}
          className="text-sm font-medium text-cdi-primary hover:underline"
        >
          {country.name}
        </Link>
      </td>
      {components.map(component => {
        const compScore = country.components[component.id];
        const displayScore = showAdjusted
          ? compScore?.scoreAdjusted
          : compScore?.score;
        const displayRank = showAdjusted
          ? compScore?.rankAdjusted
          : compScore?.rank;

        return (
          <td
            key={component.id}
            className="px-2 py-2 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onCellClick(country, component.id)}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs font-medium text-gray-600">
                #{displayRank}
              </div>
              <div className="w-full max-w-[60px]">
                <ScoreBar
                  score={displayScore ?? 0}
                  color={component.color}
                  size="sm"
                  showValue={false}
                />
              </div>
              <div className="text-xs text-gray-500">
                {displayScore?.toFixed(1)}
              </div>
            </div>
          </td>
        );
      })}
    </tr>
  );
}
