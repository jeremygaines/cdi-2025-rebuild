import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';

export function FilterBar() {
  const { countryGroups } = useData();
  const { selectedGroupId, setSelectedGroupId, showAdjusted, setShowAdjusted } = useFilters();

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side - Country group filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Country Group
              </span>
              <InfoIcon />
            </div>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm bg-white min-w-[200px] focus:ring-2 focus:ring-cdi-primary focus:border-cdi-primary"
            >
              {countryGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right side - Toggle and button */}
          <div className="flex items-center gap-6">
            {/* Income-adjusted toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Income-Adjusted Rankings
                </span>
                <InfoIcon />
              </div>
              <button
                onClick={() => setShowAdjusted(!showAdjusted)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                  showAdjusted ? 'bg-cdi-primary' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={showAdjusted}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    showAdjusted ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
                <span className={`absolute text-[10px] font-bold ${showAdjusted ? 'left-1.5 text-white' : 'right-1.5 text-gray-500'}`}>
                  {showAdjusted ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* How CDI Works button */}
            <button
              onClick={() => {
                window.open('https://www.cgdev.org/cdi', '_blank');
              }}
              className="border border-gray-400 text-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors uppercase tracking-wide"
            >
              How the CDI Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] cursor-help" title="More information">
      ?
    </span>
  );
}
