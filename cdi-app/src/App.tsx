import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import { FilterProvider } from '@/context/FilterContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { HomePage } from '@/pages/HomePage';
import { ComponentPage } from '@/pages/ComponentPage';
import { SubcomponentPage } from '@/pages/SubcomponentPage';
import { IndicatorIndexPage } from '@/pages/IndicatorIndexPage';
import { CountryReportPage } from '@/pages/CountryReportPage';
import { CountryComponentPage } from '@/pages/CountryComponentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <FilterProvider>
          <PageLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/component/:componentId" element={<ComponentPage />} />
              <Route path="/component/:componentId/:subcomponentId" element={<SubcomponentPage />} />
              <Route path="/indicators" element={<IndicatorIndexPage />} />
              <Route path="/country/:countryId" element={<CountryReportPage />} />
              <Route path="/country/:countryId/:componentId" element={<CountryComponentPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageLayout>
        </FilterProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
