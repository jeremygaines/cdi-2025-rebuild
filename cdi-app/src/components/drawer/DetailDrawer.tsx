import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Country, Component } from '@/types';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { ScoreBar } from '@/components/visualization/ScoreBar';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  componentId?: string | null;
}

export function DetailDrawer({ isOpen, onClose, country, componentId }: DetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { getComponent, subcomponents } = useData();
  const { showAdjusted } = useFilters();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!country) return null;

  const component = componentId ? getComponent(componentId) : null;
  const compScore = component ? country.components[component.id] : null;

  // Get subcomponents for the selected component
  const componentSubcomponents = component
    ? subcomponents.filter(s => s.componentId === component.id)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-cdi-primary text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{country.name}</h2>
            {component && (
              <p className="text-white/80 text-sm">{component.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
          {component && compScore ? (
            <ComponentDetail
              country={country}
              component={component}
              compScore={compScore}
              subcomponents={componentSubcomponents}
              showAdjusted={showAdjusted}
            />
          ) : (
            <OverviewDetail country={country} showAdjusted={showAdjusted} />
          )}

          {/* Link to full report */}
          <div className="mt-6 pt-6 border-t">
            <Link
              to={component ? `/country/${country.id}/${component.id}` : `/country/${country.id}`}
              className="block w-full text-center bg-cdi-primary text-white py-3 rounded hover:bg-cdi-dark transition-colors"
              onClick={onClose}
            >
              View Full {component ? 'Component' : 'Country'} Report
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

interface ComponentDetailProps {
  country: Country;
  component: Component;
  compScore: Country['components'][string];
  subcomponents: { id: string; name: string }[];
  showAdjusted: boolean;
}

function ComponentDetail({ component, compScore, subcomponents, showAdjusted }: ComponentDetailProps) {
  const displayScore = showAdjusted ? compScore.scoreAdjusted : compScore.score;
  const displayRank = showAdjusted ? compScore.rankAdjusted : compScore.rank;

  return (
    <div>
      {/* Component score */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: component.color }}>
          {component.name} Score
        </h3>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl font-bold" style={{ color: component.color }}>
            {displayScore.toFixed(1)}
          </span>
          <span className="text-gray-500">Rank #{displayRank}</span>
        </div>
        <ScoreBar score={displayScore} color={component.color} size="lg" showValue={false} />
      </div>

      {/* Subcomponent breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Subcomponent Scores
        </h4>
        <div className="space-y-4">
          {subcomponents.map(sub => {
            const subScore = compScore.subcomponents?.[sub.id];
            return (
              <div key={sub.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                  <span className="text-xs text-gray-500">#{subScore?.rank ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold" style={{ color: component.color }}>
                    {subScore?.score?.toFixed(1) ?? '-'}
                  </span>
                  <div className="flex-1">
                    <ScoreBar
                      score={subScore?.score ?? 0}
                      color={component.color}
                      size="sm"
                      showValue={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface OverviewDetailProps {
  country: Country;
  showAdjusted: boolean;
}

function OverviewDetail({ country, showAdjusted }: OverviewDetailProps) {
  const { components } = useData();
  const score = showAdjusted ? country.scoreAdjusted : country.score;
  const rank = showAdjusted ? country.rankAdjusted : country.rank;

  return (
    <div>
      {/* Overall score */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-cdi-primary mb-3">
          Overall CDI Score
        </h3>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl font-bold text-cdi-primary">
            {score.toFixed(1)}
          </span>
          <span className="text-gray-500">Rank #{rank}</span>
        </div>
        <ScoreBar score={score} color="#1B5E5E" size="lg" showValue={false} />
      </div>

      {/* Component breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Component Scores
        </h4>
        <div className="space-y-3">
          {components.map(comp => {
            const compScore = country.components[comp.id];
            const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
            const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;

            return (
              <div key={comp.id} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: comp.color }}
                />
                <span className="text-sm text-gray-700 min-w-[120px]">{comp.shortName}</span>
                <div className="flex-1">
                  <ScoreBar
                    score={displayScore ?? 0}
                    color={comp.color}
                    size="sm"
                    showValue={false}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 min-w-[50px] text-right">
                  {displayScore?.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400 min-w-[30px]">
                  #{displayRank}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
