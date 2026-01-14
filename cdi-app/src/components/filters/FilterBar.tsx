import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';

export function FilterBar() {
  const { countryGroups } = useData();
  const { selectedGroupId, setSelectedGroupId, showAdjusted, setShowAdjusted } = useFilters();

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          {/* Country group filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="country-group" className="text-sm font-medium text-gray-700">
              Filter:
            </label>
            <select
              id="country-group"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-cdi-primary focus:border-cdi-primary"
            >
              {countryGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Income-adjusted toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAdjusted}
              onChange={(e) => setShowAdjusted(e.target.checked)}
              className="w-4 h-4 text-cdi-primary border-gray-300 rounded focus:ring-cdi-primary"
            />
            <span className="text-sm text-gray-700">
              Show Income-Adjusted Rankings
            </span>
          </label>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
