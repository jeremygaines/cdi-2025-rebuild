import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import type { Country } from '@/types';

interface CountryOverviewProps {
  country: Country;
  onClose: () => void;
}

export function CountryOverview({ country, onClose }: CountryOverviewProps) {
  const { getCountryReport } = useData();

  // Get country report data
  const countryReport = getCountryReport(country.id);
  const overviewHtml = countryReport?.overall || `<p>${country.name} ranks ${country.rank}th in the Commitment to Development Index.</p>`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + `/country/${country.id}` : '';
  const shareText = `Check out ${country.name}'s performance in the Commitment to Development Index`;

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <tr>
      <td colSpan={100} className="bg-white border-b border-gray-200">
        <div className="px-6 py-6 max-w-5xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
              Overall:
            </h3>
            <button
              onClick={onClose}
              className="text-cdi-primary hover:text-cdi-dark text-sm font-medium flex items-center gap-1"
            >
              CLOSE
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6m0-6l6 6" />
              </svg>
            </button>
          </div>

          <div
            className="text-gray-700 leading-relaxed space-y-4 mb-6"
            dangerouslySetInnerHTML={{ __html: overviewHtml }}
          />

          <div className="flex items-center gap-4">
            <Link
              to={`/country/${country.id}`}
              className="bg-cdi-primary text-white px-8 py-3 font-medium hover:bg-cdi-dark transition-colors uppercase tracking-wide"
            >
              View Country Report
            </Link>

            <span className="text-sm text-gray-600 font-medium uppercase tracking-wide">
              Share
            </span>

            <button
              onClick={handleFacebookShare}
              className="border-2 border-cdi-primary text-cdi-primary hover:bg-cdi-primary hover:text-white transition-colors p-2 rounded"
              aria-label="Share on Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button
              onClick={handleTwitterShare}
              className="border-2 border-cdi-primary text-cdi-primary hover:bg-cdi-primary hover:text-white transition-colors p-2 rounded"
              aria-label="Share on Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
