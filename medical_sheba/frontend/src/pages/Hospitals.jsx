import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import HospitalCard from '../components/HospitalCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { hospitalsAPI } from '../api/hospitals';
import '../styles/pages/Hospitals.css';

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data } = await hospitalsAPI.list();
      setHospitals(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchHospitals();
      return;
    }
    try {
      setLoading(true);
      const { data } = await hospitalsAPI.search(searchQuery);
      setHospitals(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospitals-page">
      <div className="page-header">
        <h1>Find Hospitals</h1>
        <p>Discover healthcare facilities near you</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by hospital name or location..."
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
      {error && <Error message={error} onRetry={fetchHospitals} />}

      {!loading && !error && (
        <div className="hospitals-grid">
          {hospitals.length > 0 ? (
            hospitals.map(hospital => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))
          ) : (
            <p className="no-results">No hospitals found. Try different search criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}
