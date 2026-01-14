import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FilterContextType {
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
  showAdjusted: boolean;
  setShowAdjusted: (show: boolean) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [selectedGroupId, setSelectedGroupIdState] = useState(() =>
    searchParams.get('group') ?? 'all'
  );
  const [showAdjusted, setShowAdjustedState] = useState(() =>
    searchParams.get('adjusted') === 'true'
  );

  // Sync state changes to URL
  const setSelectedGroupId = (id: string) => {
    setSelectedGroupIdState(id);
    const newParams = new URLSearchParams(searchParams);
    if (id === 'all') {
      newParams.delete('group');
    } else {
      newParams.set('group', id);
    }
    setSearchParams(newParams, { replace: true });
  };

  const setShowAdjusted = (show: boolean) => {
    setShowAdjustedState(show);
    const newParams = new URLSearchParams(searchParams);
    if (show) {
      newParams.set('adjusted', 'true');
    } else {
      newParams.delete('adjusted');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Sync URL changes to state (e.g., browser back/forward)
  useEffect(() => {
    const group = searchParams.get('group') ?? 'all';
    const adjusted = searchParams.get('adjusted') === 'true';
    setSelectedGroupIdState(group);
    setShowAdjustedState(adjusted);
  }, [searchParams]);

  return (
    <FilterContext.Provider
      value={{ selectedGroupId, setSelectedGroupId, showAdjusted, setShowAdjusted }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
