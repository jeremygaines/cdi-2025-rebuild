import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CDIData, Country, Component, Subcomponent, Indicator, CountryGroup, CountryReport, Blurbs } from '@/types';

interface DataContextType {
  data: CDIData | null;
  countries: Country[];
  components: Component[];
  subcomponents: Subcomponent[];
  indicators: Indicator[];
  countryGroups: CountryGroup[];
  countryReports: Record<string, CountryReport>;
  blurbs: Blurbs;
  year: number;
  loading: boolean;
  error: Error | null;
  getCountry: (id: string) => Country | undefined;
  getComponent: (id: string) => Component | undefined;
  getSubcomponent: (id: string) => Subcomponent | undefined;
  getIndicator: (id: string) => Indicator | undefined;
  getCountryReport: (id: string) => CountryReport | undefined;
  getBlurb: (componentId: string, subcomponentId?: string, indicatorId?: string) => string | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CDIData | null>(null);
  const [countryReports, setCountryReports] = useState<Record<string, CountryReport>>({});
  const [blurbs, setBlurbs] = useState<Blurbs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load main CDI data
        const cdiResponse = await fetch('/data/cdi-data.json');
        if (!cdiResponse.ok) {
          throw new Error('Failed to load CDI data');
        }
        const cdiData = await cdiResponse.json();

        // Load country groups
        const groupsResponse = await fetch('/data/country-groups.json');
        if (!groupsResponse.ok) {
          throw new Error('Failed to load country groups');
        }
        const groupsData = await groupsResponse.json();

        // Load country reports
        const reportsResponse = await fetch('/data/country-reports.json');
        if (!reportsResponse.ok) {
          throw new Error('Failed to load country reports');
        }
        const reportsData = await reportsResponse.json();
        setCountryReports(reportsData);

        // Load blurbs
        const blurbsResponse = await fetch('/data/blurbs.json');
        if (!blurbsResponse.ok) {
          throw new Error('Failed to load blurbs');
        }
        const blurbsData = await blurbsResponse.json();
        setBlurbs(blurbsData);

        // Transform country groups to match our data structure
        const countryGroups: CountryGroup[] = [
          { id: 'all', name: 'All Countries', countryIds: cdiData.countries.map((c: Country) => c.id) },
          ...Object.entries(groupsData.countryGroups).map(([key, value]: [string, any]) => ({
            id: key,
            name: value.name,
            countryIds: value.countries
          }))
        ];

        // Merge the data
        setData({
          ...cdiData,
          countryGroups
        });
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
  const getCountryReport = (id: string) => countryReports[id];
  const getBlurb = (componentId: string, subcomponentId?: string, indicatorId?: string): string | undefined => {
    const comp = blurbs[componentId];
    if (!comp) return undefined;
    if (!subcomponentId) return comp.description;
    const sub = comp.subcomponents[subcomponentId];
    if (!sub) return undefined;
    if (!indicatorId) return sub.description;
    return sub.indicators[indicatorId]?.description;
  };

  const value: DataContextType = {
    data,
    countries: data?.countries ?? [],
    components: data?.components ?? [],
    subcomponents: data?.subcomponents ?? [],
    indicators: data?.indicators ?? [],
    countryGroups: data?.countryGroups ?? [],
    countryReports,
    blurbs,
    year: data?.year ?? 2025,
    loading,
    error,
    getCountry,
    getComponent,
    getSubcomponent,
    getIndicator,
    getCountryReport,
    getBlurb,
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
