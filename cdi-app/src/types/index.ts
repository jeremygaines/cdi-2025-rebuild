// Core data types for the CDI application

export interface Country {
  id: string; // ISO code (e.g., "SWE")
  name: string;
  score: number;
  scoreAdjusted: number;
  rank: number;
  rankAdjusted: number;
  isTied: boolean;
  isTiedAdjusted: boolean;
  components: Record<string, CountryComponentScore>;
}

export interface CountryComponentScore {
  score: number;
  scoreAdjusted: number;
  rank: number;
  rankAdjusted: number;
  isTied: boolean;
  isTiedAdjusted: boolean;
  subcomponents: Record<string, CountrySubcomponentScore>;
}

export interface CountrySubcomponentScore {
  score: number;
  rank: number;
  indicators: Record<string, CountryIndicatorScore>;
}

export interface CountryIndicatorScore {
  score: number;
  rank: number;
  missingData: boolean;
}

export interface Component {
  id: string; // machine name (e.g., "development-finance")
  name: string;
  shortName: string;
  color: string;
  group: 'finance' | 'exchange' | 'global';
  description: string;
  subcomponents: string[]; // array of subcomponent IDs
}

export interface Subcomponent {
  id: string;
  name: string;
  componentId: string;
  description: string;
  indicators: string[]; // array of indicator IDs
}

export interface Indicator {
  id: string;
  name: string;
  subcomponentId: string;
  componentId: string;
  unit: string;
  description: string;
  lowerIsBetter: boolean;
}

export interface CountryGroup {
  id: string;
  name: string;
  countryIds: string[];
}

// Component IDs used throughout the app
export type ComponentId =
  | 'development-finance'
  | 'investment'
  | 'migration'
  | 'trade'
  | 'environment'
  | 'health'
  | 'security'
  | 'technology';

// The full data structure loaded from JSON
export interface CDIData {
  countries: Country[];
  components: Component[];
  subcomponents: Subcomponent[];
  indicators: Indicator[];
  countryGroups: CountryGroup[];
  year: number;
}

// Filter state
export interface FilterState {
  selectedGroupId: string | null;
  showAdjusted: boolean;
}

// For ranking tables
export interface RankedItem {
  id: string;
  name: string;
  score: number;
  rank: number;
  isTied: boolean;
}
