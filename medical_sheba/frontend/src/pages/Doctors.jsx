import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Award } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
import Pagination from '../components/Pagination';
import { doctorsAPI } from '../api/doctors';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Doctors.css';

export default function Doctors() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.doctors);
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let allDoctors = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages from backend API (which uses 20-item pagination)
      while (hasMore) {
        const response = await doctorsAPI.list({ page });
        const data = response.data;
        
        if (data.results) {
          allDoctors = [...allDoctors, ...data.results];
          // Check if there are more pages
          hasMore = !!data.next;
          page++;
        } else if (Array.isArray(data)) {
          allDoctors = data;
          hasMore = false;
        } else {
          allDoctors = data;
          hasMore = false;
        }
      }
      
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
    const filtered = doctors.filter(doctor => {
      const fullName = (doctor.user_name || '').toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

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
        <p>Showing <strong>{filteredDoctors.length}</strong> doctors</p>
      </div>

      <div className="doctors-grid">
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
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
        ) : (
          <div className="no-results">
            <h3>No doctors found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>

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
