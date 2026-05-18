import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import Pagination from '../components/Pagination';
import { hospitalsAPI } from '../api/hospitals';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Hospitals.css';

const getListData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function Hospitals() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.hospitals);
  
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 16;

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      let allHospitals = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages from backend API (which uses 20-item pagination)
      while (hasMore) {
        const response = await hospitalsAPI.list({ page });
        const data = response.data;
        
        const pageHospitals = getListData(data);

        if (Array.isArray(data?.results)) {
          allHospitals = [...allHospitals, ...pageHospitals];
          // Check if there are more pages
          hasMore = !!data.next;
          page++;
        } else {
          allHospitals = pageHospitals;
          hasMore = false;
        }
      }
      
      setHospitals(allHospitals);
      setFilteredHospitals(allHospitals);
      setError(null);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredHospitals(hospitals);
      setCurrentPage(1);
      return;
    }
    const filtered = hospitals.filter(hospital => {
      const name = (hospital.name || '').toLowerCase();
      const district = (hospital.district || '').toLowerCase();
      return (
        name.includes(searchQuery.toLowerCase()) ||
        district.includes(searchQuery.toLowerCase())
      );
    });
    setFilteredHospitals(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="hospitals-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Hospitals</h1>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by hospital name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </div>

      <div className="filter-info">
        <p>Showing <strong>{filteredHospitals.length}</strong> hospitals</p>
      </div>

      <div className="hospitals-grid">
        {loading ? (
          <div className="no-results">
            <h3>Loading hospitals...</h3>
          </div>
        ) : error ? (
          <div className="no-results">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchHospitals} className="btn-search">Retry</button>
          </div>
        ) : filteredHospitals.length > 0 ? (
          filteredHospitals
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map(hospital => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))
        ) : (
          <div className="no-results">
            <h3>No hospitals found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>

      {filteredHospitals.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE)}
          totalItems={filteredHospitals.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
