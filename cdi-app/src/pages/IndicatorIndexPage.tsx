import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Loading } from '@/components/common/Loading';
import { Hero } from '@/components/layout/Hero';

export function IndicatorIndexPage() {
  const { loading, error, components, subcomponents, indicators } = useData();

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  // Group indicators by component
  const indicatorsByComponent = components.map(component => {
    const componentSubcomponents = subcomponents.filter(s => s.componentId === component.id);

    return {
      component,
      subcomponents: componentSubcomponents.map(sub => ({
        subcomponent: sub,
        indicators: indicators.filter(i => sub.indicators.includes(i.id))
      }))
    };
  });

  return (
    <div>
      <Hero
        title="CDI Indicators"
        subtitle="All indicators used to calculate the Commitment to Development Index"
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-cdi-primary hover:underline">
            CDI Rankings
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Indicators</span>
        </nav>

        {/* Indicator list by component */}
        <div className="space-y-8">
          {indicatorsByComponent.map(({ component, subcomponents: subs }) => (
            <div key={component.id} className="border rounded-lg overflow-hidden">
              {/* Component header */}
              <div
                className="px-6 py-4 text-white"
                style={{ backgroundColor: component.color }}
              >
                <Link
                  to={`/component/${component.id}`}
                  className="text-xl font-bold hover:underline"
                >
                  {component.name}
                </Link>
                <p className="text-white/80 text-sm mt-1">{component.description}</p>
              </div>

              {/* Subcomponents and indicators */}
              <div className="divide-y">
                {subs.map(({ subcomponent, indicators: subIndicators }) => (
                  <div key={subcomponent.id} className="p-4">
                    <Link
                      to={`/component/${component.id}/${subcomponent.id}`}
                      className="font-semibold text-gray-800 hover:text-cdi-primary"
                    >
                      {subcomponent.name}
                    </Link>

                    {subIndicators.length > 0 ? (
                      <ul className="mt-2 ml-4 space-y-1">
                        {subIndicators.map(indicator => (
                          <li key={indicator.id} className="text-sm text-gray-600">
                            <span className="mr-2">•</span>
                            {indicator.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 ml-4 text-sm text-gray-400 italic">
                        No indicators defined
                      </p>
                    )}
                  </div>
                ))}

                {subs.length === 0 && (
                  <div className="p-4 text-gray-400 italic">
                    No subcomponents defined
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t text-center text-gray-600">
          <p>
            Total: {components.length} components, {subcomponents.length} subcomponents, {indicators.length} indicators
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-cdi-primary hover:underline">
            Back to Main Rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
