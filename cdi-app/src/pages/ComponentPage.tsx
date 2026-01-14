import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Loading } from '@/components/common/Loading';
import { Hero } from '@/components/layout/Hero';
import { ComponentRankingTable } from '@/components/table/ComponentRankingTable';

export function ComponentPage() {
  const { componentId } = useParams<{ componentId: string }>();
  const { loading, error, getComponent, components } = useData();

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  const component = getComponent(componentId ?? '');
  if (!component) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Component not found</h2>
        <Link to="/" className="text-cdi-primary hover:underline">
          Return to main ranking
        </Link>
      </div>
    );
  }

  // Get previous and next components for navigation
  const currentIndex = components.findIndex(c => c.id === componentId);
  const prevComponent = currentIndex > 0 ? components[currentIndex - 1] : null;
  const nextComponent = currentIndex < components.length - 1 ? components[currentIndex + 1] : null;

  return (
    <div>
      <Hero title={component.name} subtitle={component.description} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-cdi-primary hover:underline">
            CDI Rankings
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{component.name}</span>
        </nav>

        {/* Component ranking table */}
        <ComponentRankingTable componentId={component.id} />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          {prevComponent ? (
            <Link
              to={`/component/${prevComponent.id}`}
              className="text-cdi-primary hover:underline"
            >
              &larr; {prevComponent.name}
            </Link>
          ) : (
            <div />
          )}
          <Link to="/" className="text-cdi-primary hover:underline">
            Back to Main Rankings
          </Link>
          {nextComponent ? (
            <Link
              to={`/component/${nextComponent.id}`}
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
