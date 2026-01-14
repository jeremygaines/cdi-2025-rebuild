import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useFilters } from '@/context/FilterContext';
import { Loading } from '@/components/common/Loading';
import { Hero } from '@/components/layout/Hero';
import { ScoreBar } from '@/components/visualization/ScoreBar';

export function CountryReportPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const { loading, error, getCountry, countries, components } = useData();
  const { showAdjusted } = useFilters();

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  const country = getCountry(countryId ?? '');
  if (!country) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Country not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  // Get sorted countries for navigation
  const sortedCountries = [...countries].sort((a, b) =>
    showAdjusted ? a.rankAdjusted - b.rankAdjusted : a.rank - b.rank
  );
  const currentIndex = sortedCountries.findIndex(c => c.id === countryId);
  const prevCountry = currentIndex > 0 ? sortedCountries[currentIndex - 1] : null;
  const nextCountry = currentIndex < sortedCountries.length - 1 ? sortedCountries[currentIndex + 1] : null;

  const score = showAdjusted ? country.scoreAdjusted : country.score;
  const rank = showAdjusted ? country.rankAdjusted : country.rank;

  return (
    <div>
      <Hero title={country.name} subtitle={`CDI Rank: #${rank}`} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-cdi-primary hover:underline">
            CDI Rankings
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{country.name}</span>
        </nav>

        {/* Country navigation */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          {prevCountry ? (
            <Link
              to={`/country/${prevCountry.id}`}
              className="text-cdi-primary hover:underline"
            >
              &larr; {prevCountry.name}
            </Link>
          ) : (
            <div />
          )}
          <div className="text-lg font-semibold">
            #{rank} of {countries.length}
          </div>
          {nextCountry ? (
            <Link
              to={`/country/${nextCountry.id}`}
              className="text-cdi-primary hover:underline"
            >
              {nextCountry.name} &rarr;
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Overall score */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Overall CDI Score</h2>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-cdi-primary">
              {score.toFixed(1)}
            </div>
            <div className="flex-1 max-w-md">
              <ScoreBar score={score} color="#1B5E5E" size="lg" showValue={false} />
            </div>
          </div>
        </div>

        {/* Component scores */}
        <h2 className="text-xl font-semibold mb-4">Component Scores</h2>
        <div className="grid gap-4">
          {components.map(component => {
            const compScore = country.components[component.id];
            if (!compScore) return null;

            const displayScore = showAdjusted ? compScore.scoreAdjusted : compScore.score;
            const displayRank = showAdjusted ? compScore.rankAdjusted : compScore.rank;

            return (
              <Link
                key={component.id}
                to={`/country/${country.id}/${component.id}`}
                className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: component.color }}>
                    {component.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Rank #{displayRank}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold" style={{ color: component.color }}>
                    {displayScore.toFixed(1)}
                  </div>
                  <div className="flex-1">
                    <ScoreBar score={displayScore} color={component.color} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8 pt-6 border-t">
          <Link to="/" className="text-cdi-primary hover:underline">
            Back to Main Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
