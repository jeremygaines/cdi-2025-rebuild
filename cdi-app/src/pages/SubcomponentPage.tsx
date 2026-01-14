import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Loading } from '@/components/common/Loading';
import { Hero } from '@/components/layout/Hero';
import { ScoreBar } from '@/components/visualization/ScoreBar';

export function SubcomponentPage() {
  const { componentId, subcomponentId } = useParams<{
    componentId: string;
    subcomponentId: string;
  }>();
  const { loading, error, getComponent, subcomponents, countries } = useData();

  const component = getComponent(componentId ?? '');
  const subcomponent = subcomponents.find(s => s.id === subcomponentId);

  // Calculate rankings for this subcomponent
  const rankedCountries = useMemo(() => {
    if (!subcomponent || !component) return [];

    return countries
      .map(country => {
        const compScore = country.components[component.id];
        const subScore = compScore?.subcomponents?.[subcomponent.id];
        return {
          country,
          score: subScore?.score ?? 0,
          rank: subScore?.rank ?? 999
        };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [countries, component, subcomponent]);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  if (!component || !subcomponent) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subcomponent not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  // Get sibling subcomponents for navigation
  const siblingSubcomponents = subcomponents.filter(s => s.componentId === component.id);
  const currentIndex = siblingSubcomponents.findIndex(s => s.id === subcomponentId);
  const prevSubcomponent = currentIndex > 0 ? siblingSubcomponents[currentIndex - 1] : null;
  const nextSubcomponent = currentIndex < siblingSubcomponents.length - 1
    ? siblingSubcomponents[currentIndex + 1]
    : null;

  return (
    <div>
      <Hero title={subcomponent.name} subtitle={subcomponent.description} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-cdi-primary hover:underline">
            CDI Rankings
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/component/${component.id}`} className="text-cdi-primary hover:underline">
            {component.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{subcomponent.name}</span>
        </nav>

        {/* Component badge */}
        <div className="mb-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-white text-sm"
            style={{ backgroundColor: component.color }}
          >
            {component.name}
          </span>
        </div>

        {/* Rankings table */}
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
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedCountries.map(({ country, score, rank }, index) => (
                <tr
                  key={country.id}
                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                >
                  <td className="px-3 py-3 text-sm font-medium">
                    {rank}
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: component.color }}>
                        {score.toFixed(1)}
                      </span>
                      <div className="w-32">
                        <ScoreBar
                          score={score}
                          color={component.color}
                          size="sm"
                          showValue={false}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          {prevSubcomponent ? (
            <Link
              to={`/component/${component.id}/${prevSubcomponent.id}`}
              className="text-cdi-primary hover:underline"
            >
              &larr; {prevSubcomponent.name}
            </Link>
          ) : (
            <div />
          )}
          <Link to={`/component/${component.id}`} className="text-cdi-primary hover:underline">
            Back to {component.name}
          </Link>
          {nextSubcomponent ? (
            <Link
              to={`/component/${component.id}/${nextSubcomponent.id}`}
              className="text-cdi-primary hover:underline"
            >
              {nextSubcomponent.name} &rarr;
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
