import { useState } from 'react';
import { Search, Plus, MapPin, Phone } from 'lucide-react';
import '../styles/pages/Blood.css';

const sampleBloodDonors = [
  { id: 1, name: 'Ahmed Hassan', blood_type: 'O+', location: 'Dhaka', phone: '+880-1700-100001', lastDonated: '2 months ago' },
  { id: 2, name: 'Fatima Rahman', blood_type: 'B+', location: 'Dhaka', phone: '+880-1700-100002', lastDonated: '1 month ago' },
  { id: 3, name: 'Mohammad Karim', blood_type: 'AB+', location: 'Chittagong', phone: '+880-1700-100003', lastDonated: '3 months ago' },
  { id: 4, name: 'Samina Begum', blood_type: 'A+', location: 'Dhaka', phone: '+880-1700-100004', lastDonated: '2 weeks ago' },
  { id: 5, name: 'Rajesh Kumar', blood_type: 'O-', location: 'Dhaka', phone: '+880-1700-100005', lastDonated: '1 month ago' },
  { id: 6, name: 'Hafiza Aisha', blood_type: 'B-', location: 'Sylhet', phone: '+880-1700-100006', lastDonated: '6 months ago' },
  { id: 7, name: 'Hasan Ali', blood_type: 'A-', location: 'Dhaka', phone: '+880-1700-100007', lastDonated: '3 weeks ago' },
  { id: 8, name: 'Sara Khan', blood_type: 'AB-', location: 'Khulna', phone: '+880-1700-100008', lastDonated: '4 months ago' },
];

export default function BloodBank() {
  const [bloodDonors] = useState(sampleBloodDonors);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDonors, setFilteredDonors] = useState(sampleBloodDonors);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredDonors(bloodDonors);
      return;
    }
    const filtered = bloodDonors.filter(donor =>
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDonors(filtered);
  };

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

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
            <button key={type} className="blood-type-btn">{type}</button>
          ))}
        </div>
      </div>

      <div className="donors-container">
        {filteredDonors.length > 0 ? (
          <div className="donors-grid">
            {filteredDonors.map(donor => (
              <div key={donor.id} className="donor-card">
                <div className="donor-header">
                  <h3>{donor.name}</h3>
                  <div className="blood-badge">{donor.blood_type}</div>
                </div>
                <div className="donor-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{donor.location}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{donor.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="last-donated">Last donated: {donor.lastDonated}</span>
                  </div>
                </div>
                <button className="btn-contact">Contact Donor</button>
              </div>
            ))}
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
