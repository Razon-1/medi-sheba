import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Award } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.list();
      const data = response.data.results || response.data;
      setDoctors(data);
      setFilteredDoctors(data);
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
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Expert Doctors</h1>
          <p>Browse and connect with qualified healthcare professionals</p>
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
          filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        ) : (
          <div className="no-results">
            <h3>No doctors found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
