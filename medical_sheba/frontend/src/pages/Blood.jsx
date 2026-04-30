import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone } from 'lucide-react';
import { bloodAPI } from '../api/blood';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Blood.css';

export default function BloodBank() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.blood);
  
  const [bloodDonors, setBloodDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await bloodAPI.listDonors();
      const data = response.data.results || response.data;
      setBloodDonors(data);
      setFilteredDonors(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blood donors:', err);
      setError('Failed to load blood donors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredDonors(bloodDonors);
      return;
    }
    const filtered = bloodDonors.filter(donor => {
      const donorName = `${donor.user?.first_name || ''} ${donor.user?.last_name || ''}`.toLowerCase();
      return (
        donorName.includes(searchQuery.toLowerCase()) ||
        donor.blood_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.district.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredDonors(filtered);
  };

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const filterByBloodType = (type) => {
    const filtered = bloodDonors.filter(donor => donor.blood_group === type);
    setFilteredDonors(filtered);
  };

  return (
    <div className="blood-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Blood Bank</h1>
          <p>Find blood donors and manage emergency requests</p>
        </div>
      </div>

      <div className="blood-actions">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, blood type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-search">Search</button>
          </div>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Request Blood
        </button>
      </div>

      <div className="blood-type-filter">
        <h3>Quick Filter by Blood Type:</h3>
        <div className="blood-type-buttons">
          {bloodTypes.map(type => (
            <button 
              key={type} 
              className="blood-type-btn"
              onClick={() => filterByBloodType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="donors-container">
        {loading ? (
          <div className="no-results">
            <h3>Loading blood donors...</h3>
          </div>
        ) : error ? (
          <div className="no-results">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchDonors} className="btn-search">Retry</button>
          </div>
        ) : filteredDonors.length > 0 ? (
          <div className="donors-grid">
            {filteredDonors.map(donor => {
              const donorName = donor.user ? `${donor.user.first_name} ${donor.user.last_name}` : donor.name;
              const phone = donor.user?.phone;
              const location = `${donor.district}${donor.upazila ? ', ' + donor.upazila : ''}`;
              
              return (
                <div key={donor.id} className="donor-card">
                  <div className="donor-header">
                    <h3>{donorName}</h3>
                    <div className="blood-badge">{donor.blood_group}</div>
                  </div>
                  <div className="donor-details">
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{location}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="last-donated">
                        Total donations: {donor.total_donations}
                      </span>
                    </div>
                  </div>
                  <button className="btn-contact">Contact Donor</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <h3>No donors found</h3>
            <p>Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
