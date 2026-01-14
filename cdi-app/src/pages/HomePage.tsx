import { Hero } from '@/components/layout/Hero';
import { FilterBar } from '@/components/filters/FilterBar';
import { RankingTable } from '@/components/table/RankingTable';
import { useData } from '@/context/DataContext';
import { Loading } from '@/components/common/Loading';

export function HomePage() {
  const { loading, error } = useData();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data: {error.message}
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <FilterBar />
      <RankingTable />
    </div>
  );
}
