import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';
import { Hero } from '@/components/layout/Hero';
import { ScoreBar } from '@/components/visualization/ScoreBar';

export function CountryComponentPage() {
  const { countryId, componentId } = useParams<{ countryId: string; componentId: string }>();
  const { loading, error, getCountry, getComponent, components, subcomponents } = useData();
  const { showAdjusted } = useFilters();

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  const country = getCountry(countryId ?? '');
  const component = getComponent(componentId ?? '');

  if (!country || !component) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  const compScore = country.components[component.id];
  const displayScore = showAdjusted ? compScore?.scoreAdjusted : compScore?.score;
  const displayRank = showAdjusted ? compScore?.rankAdjusted : compScore?.rank;

  // Get previous and next components for navigation
  const currentIndex = components.findIndex(c => c.id === componentId);
  const prevComponent = currentIndex > 0 ? components[currentIndex - 1] : null;
  const nextComponent = currentIndex < components.length - 1 ? components[currentIndex + 1] : null;

  // Get subcomponents for this component
  const componentSubcomponents = subcomponents.filter(s => s.componentId === component.id);

  return (
    <div>
      <Hero
        title={`${country.name}: ${component.name}`}
        subtitle={component.description}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-cdi-primary hover:underline">
            CDI Rankings
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/country/${country.id}`} className="text-cdi-primary hover:underline">
            {country.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{component.name}</span>
        </nav>

        {/* Component score */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: component.color }}>
            {component.name} Score
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold" style={{ color: component.color }}>
              {displayScore?.toFixed(1) ?? 'N/A'}
            </div>
            <div className="flex-1 max-w-md">
              <ScoreBar
                score={displayScore ?? 0}
                color={component.color}
                size="lg"
                showValue={false}
              />
            </div>
            <div className="text-gray-600">
              Rank #{displayRank ?? 'N/A'}
            </div>
          </div>
        </div>

        {/* Subcomponent scores */}
        <h2 className="text-xl font-semibold mb-4">Subcomponent Breakdown</h2>
        <div className="grid gap-4">
          {componentSubcomponents.map(sub => {
            const subScore = compScore?.subcomponents?.[sub.id];
            return (
              <div
                key={sub.id}
                className="bg-white border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">
                    {sub.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Rank #{subScore?.rank ?? 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold" style={{ color: component.color }}>
                    {subScore?.score?.toFixed(1) ?? 'N/A'}
                  </div>
                  <div className="flex-1">
                    <ScoreBar score={subScore?.score ?? 0} color={component.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Component navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          {prevComponent ? (
            <Link
              to={`/country/${country.id}/${prevComponent.id}`}
              className="text-cdi-primary hover:underline"
            >
              &larr; {prevComponent.name}
            </Link>
          ) : (
            <div />
          )}
          <Link
            to={`/country/${country.id}`}
            className="text-cdi-primary hover:underline"
          >
            Back to {country.name}
          </Link>
          {nextComponent ? (
            <Link
              to={`/country/${country.id}/${nextComponent.id}`}
              className="text-cdi-primary hover:underline"
            >
              {nextComponent.name} &rarr;
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
