import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import { hospitalsAPI } from '../api/hospitals';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Hospitals.css';

export default function Hospitals() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.hospitals);
  
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalsAPI.list();
      const data = response.data.results || response.data;
      setHospitals(data);
      setFilteredHospitals(data);
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
      return;
    }
    const filtered = hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredHospitals(filtered);
  };

  return (
    <div className="hospitals-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Hospitals</h1>
          <p>Discover world-class healthcare facilities near you</p>
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
          filteredHospitals.map(hospital => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))
        ) : (
          <div className="no-results">
            <h3>No hospitals found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
