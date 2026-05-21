// Search keyword: Page Doctors - doctor listing, filters, and search.
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
import Pagination from '../components/Pagination';
import { doctorsAPI } from '../api/doctors';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Doctors.css';

const getListData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

// Main component: renders the doctors listing page.
export default function Doctors() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.doctors);
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const allDoctors = await fetchAllPages((page) => doctorsAPI.list({ page }));
      
      setDoctors(allDoctors);
      setFilteredDoctors(allDoctors);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      setCurrentPage(1);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = doctors.filter(doctor => {
      const fullName = (doctor.user_name || '').toLowerCase();
      const specialty = (doctor.specialty || '').toLowerCase();
      const hospitalName = (doctor.hospital_name || '').toLowerCase();
      return (
        fullName.includes(query) ||
        specialty.includes(query) ||
        hospitalName.includes(query)
      );
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const visibleDoctors = filteredDoctors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  // Page layout: doctor search/filter controls, doctor cards, and pagination.
  return (
    <div className="doctors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Expert Doctors</h1>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or specialty (e.g., Cardiologist)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </div>

      <div className="filter-info">
        <p>
          Showing <strong>{filteredDoctors.length}</strong> doctors
        </p>
      </div>

      {loading ? (
        <div className="no-results">
          <h3>Loading doctors...</h3>
        </div>
      ) : error ? (
        <div className="no-results">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchDoctors} className="btn-search">Retry</button>
        </div>
      ) : visibleDoctors.length > 0 ? (
        <div className="doctors-grid">
          {visibleDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No doctors found</h3>
          <p>Try different search criteria</p>
        </div>
      )}

      {filteredDoctors.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)}
          totalItems={filteredDoctors.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

const fetchAllPages = async (fetchPage) => {
  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchPage(page);
    const data = response.data;
    const pageItems = getListData(data);

    if (Array.isArray(data?.results)) {
      allItems = [...allItems, ...pageItems];
      hasMore = Boolean(data.next);
      page += 1;
    } else {
      allItems = pageItems;
      hasMore = false;
    }
  }

  return allItems;
};
