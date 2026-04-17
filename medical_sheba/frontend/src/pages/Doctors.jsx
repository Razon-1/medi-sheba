import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { doctorsAPI } from '../api/doctors';
import '../styles/pages/Doctors.css';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await doctorsAPI.list();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDoctors();
      return;
    }
    try {
      setLoading(true);
      const { data } = await doctorsAPI.search(searchQuery);
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1>Find Doctors</h1>
        <p>Search and book appointments with our qualified doctors</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <Search size={20} />
          </button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <Error message={error} onRetry={fetchDoctors} />}

      {!loading && !error && (
        <div className="doctors-grid">
          {doctors.length > 0 ? (
            doctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <p className="no-results">No doctors found. Try different search criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
