import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CDIData, Country, Component, Subcomponent, Indicator, CountryGroup } from '@/types';

interface DataContextType {
  data: CDIData | null;
  countries: Country[];
  components: Component[];
  subcomponents: Subcomponent[];
  indicators: Indicator[];
  countryGroups: CountryGroup[];
  year: number;
  loading: boolean;
  error: Error | null;
  getCountry: (id: string) => Country | undefined;
  getComponent: (id: string) => Component | undefined;
  getSubcomponent: (id: string) => Subcomponent | undefined;
  getIndicator: (id: string) => Indicator | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CDIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/cdi-data.json');
        if (!response.ok) {
          throw new Error('Failed to load CDI data');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getCountry = (id: string) => data?.countries.find(c => c.id === id);
  const getComponent = (id: string) => data?.components.find(c => c.id === id);
  const getSubcomponent = (id: string) => data?.subcomponents.find(s => s.id === id);
  const getIndicator = (id: string) => data?.indicators.find(i => i.id === id);

  const value: DataContextType = {
    data,
    countries: data?.countries ?? [],
    components: data?.components ?? [],
    subcomponents: data?.subcomponents ?? [],
    indicators: data?.indicators ?? [],
    countryGroups: data?.countryGroups ?? [],
    year: data?.year ?? 2025,
    loading,
    error,
    getCountry,
    getComponent,
    getSubcomponent,
    getIndicator,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
