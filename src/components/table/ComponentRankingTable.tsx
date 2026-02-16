import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { ScoreBar } from '@/components/visualization/ScoreBar';

interface ComponentRankingTableProps {
  componentId: string;
}

export function ComponentRankingTable({ componentId }: ComponentRankingTableProps) {
  const { countries, getComponent, subcomponents } = useData();
  const { showAdjusted } = useFilters();

  const component = getComponent(componentId);

  // Get subcomponents for this component
  const componentSubcomponents = useMemo(
    () => subcomponents.filter(s => s.componentId === componentId),
    [subcomponents, componentId]
  );

  // Sort countries by their score in this component
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const aComp = a.components[componentId];
      const bComp = b.components[componentId];
      const aRank = showAdjusted ? (aComp?.rankAdjusted ?? 999) : (aComp?.rank ?? 999);
      const bRank = showAdjusted ? (bComp?.rankAdjusted ?? 999) : (bComp?.rank ?? 999);
      return aRank - bRank;
    });
  }, [countries, componentId, showAdjusted]);

  if (!component) {
    return <div className="text-gray-500">Component not found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
              Rank
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
              Country
            </th>
            <th
              className="px-3 py-3 text-center text-sm font-semibold text-white min-w-[100px]"
              style={{ backgroundColor: component.color }}
            >
              Score
            </th>
            {componentSubcomponents.map(sub => (
              <th
                key={sub.id}
                className="px-2 py-3 text-center text-xs font-semibold text-gray-600 min-w-[80px]"
              >
                {sub.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCountries.map((country, index) => {
            const compScore = country.components[componentId];
            const displayScore = showAdjusted
              ? compScore?.scoreAdjusted
              : compScore?.score;
            const displayRank = showAdjusted
              ? compScore?.rankAdjusted
              : compScore?.rank;
            const isTied = showAdjusted
              ? compScore?.isTiedAdjusted
              : compScore?.isTied;

            return (
              <tr
                key={country.id}
                className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}
              >
                <td className="px-3 py-3 text-sm font-medium">
                  {displayRank}{isTied && <span className="text-gray-400">*</span>}
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/country/${country.id}`}
                    className="text-sm font-medium text-cdi-primary hover:underline"
                  >
                    {country.name}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold min-w-[3rem]"
                      style={{ color: component.color }}
                    >
                      {displayScore?.toFixed(1)}
                    </span>
                    <div className="flex-1 max-w-[100px]">
                      <ScoreBar
                        score={displayScore ?? 0}
                        color={component.color}
                        size="sm"
                        showValue={false}
                        rank={displayRank}
                        label={component.name}
                      />
                    </div>
                  </div>
                </td>
                {componentSubcomponents.map(sub => {
                  const subScore = compScore?.subcomponents?.[sub.id];
                  return (
                    <td key={sub.id} className="px-2 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">
                          #{subScore?.rank ?? '-'}
                        </span>
                        <span className="text-xs font-medium">
                          {subScore?.score?.toFixed(1) ?? '-'}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
