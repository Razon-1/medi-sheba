import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { bloodAPI } from '../api/blood';
import Loading from '../components/Loading';
import Error from '../components/Error';
import '../styles/pages/Blood.css';

export default function BloodBank() {
  const [bloodDonors, setBloodDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBloodDonors();
  }, []);

  const fetchBloodDonors = async () => {
    try {
      setLoading(true);
      const { data } = await bloodAPI.list();
      setBloodDonors(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load blood donors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBloodDonors();
      return;
    }
    try {
      setLoading(true);
      const { data } = await bloodAPI.search(searchQuery);
      setBloodDonors(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-page">
      <div className="page-header">
        <h1>Blood Bank</h1>
        <p>Find blood donors and manage blood requests</p>
      </div>

      <div className="blood-actions">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by blood type, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>
              <Search size={20} />
            </button>
          </div>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Request Blood
        </button>
      </div>

      {loading && <Loading />}
      {error && <Error message={error} onRetry={fetchBloodDonors} />}

      {!loading && !error && (
        <div className="blood-donors-list">
          <div className="blood-table">
            <div className="table-header">
              <div>Name</div>
              <div>Blood Type</div>
              <div>Location</div>
              <div>Phone</div>
              <div>Action</div>
            </div>
            {bloodDonors.length > 0 ? (
              bloodDonors.map(donor => (
                <div key={donor.id} className="table-row">
                  <div>{donor.name}</div>
                  <div className="blood-type">{donor.blood_type}</div>
                  <div>{donor.location}</div>
                  <div>{donor.phone}</div>
                  <div>
                    <button className="btn-contact">Contact</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No blood donors found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
