import { useState, useEffect } from 'react';
import { PhoneCall, MapPin, DollarSign, AlertCircle, Clock } from 'lucide-react';
import { ambulanceAPI } from '../api/ambulance';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Ambulance.css';

export default function Ambulance() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.ambulance || { title: 'Ambulance Services | Medi Sheba', description: 'Emergency ambulance services' });
  
  const [ambulances, setAmbulances] = useState([]);
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await ambulanceAPI.listServices();
      const data = response.data.results || response.data;
      setAmbulances(data);
      setFilteredAmbulances(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ambulances:', err);
      setError('Failed to load ambulance services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = ambulances;

    // Apply vehicle type filter
    if (filterType) {
      filtered = filtered.filter(amb => amb.vehicle_type === filterType);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(amb =>
        amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amb.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amb.phone_number.includes(searchQuery)
      );
    }

    setFilteredAmbulances(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [filterType]);

  const getVehicleTypeLabel = (type) => {
    const types = {
      'basic': 'Basic Ambulance',
      'advanced': 'Advanced Life Support',
      'icu': 'ICU Ambulance'
    };
    return types[type] || type;
  };

  const getVehicleTypeColor = (type) => {
    const colors = {
      'basic': '#4CAF50',
      'advanced': '#2196F3',
      'icu': '#F44336'
    };
    return colors[type] || '#333';
  };

  return (
    <div className="ambulance-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Emergency Ambulance Services</h1>
          <p>24/7 ambulance services for your medical emergencies</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <PhoneCall size={20} />
          <input
            type="text"
            placeholder="Search by name, driver, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>

        <div className="filter-buttons">
          <h3>Filter by Vehicle Type:</h3>
          <div className="button-group">
            <button
              className={`filter-btn ${filterType === '' ? 'active' : ''}`}
              onClick={() => setFilterType('')}
            >
              All Types
            </button>
            <button
              className={`filter-btn ${filterType === 'basic' ? 'active' : ''}`}
              onClick={() => setFilterType('basic')}
            >
              Basic
            </button>
            <button
              className={`filter-btn ${filterType === 'advanced' ? 'active' : ''}`}
              onClick={() => setFilterType('advanced')}
            >
              Advanced
            </button>
            <button
              className={`filter-btn ${filterType === 'icu' ? 'active' : ''}`}
              onClick={() => setFilterType('icu')}
            >
              ICU
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="filter-info">
        <p>Showing <strong>{filteredAmbulances.length}</strong> ambulance services available</p>
      </div>

      {/* Ambulance List */}
      <div className="ambulance-list">
        {loading ? (
          <div className="no-results">
            <h3>Loading ambulance services...</h3>
          </div>
        ) : error ? (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchAmbulances} className="btn-search">Retry</button>
          </div>
        ) : filteredAmbulances.length > 0 ? (
          filteredAmbulances.map(ambulance => (
            <div key={ambulance.id} className="ambulance-card">
              <div className="ambulance-header">
                <div className="ambulance-name-section">
                  <h3>{ambulance.name}</h3>
                  <span 
                    className="vehicle-type-badge" 
                    style={{ backgroundColor: getVehicleTypeColor(ambulance.vehicle_type) }}
                  >
                    {getVehicleTypeLabel(ambulance.vehicle_type)}
                  </span>
                </div>
                <div className="availability-status">
                  {ambulance.is_available ? (
                    <span className="available">Available</span>
                  ) : (
                    <span className="unavailable">Unavailable</span>
                  )}
                </div>
              </div>

              <div className="ambulance-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <PhoneCall size={16} />
                    <span className="label">Driver:</span>
                    <span className="value">{ambulance.driver_name}</span>
                  </div>
                  <div className="detail-item">
                    <PhoneCall size={16} />
                    <span className="label">Contact:</span>
                    <span className="value">{ambulance.phone_number}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span className="label">Location:</span>
                    <span className="value">{ambulance.district_name}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span className="label">Rate:</span>
                    <span className="value">BDT {ambulance.cost_per_km}/km</span>
                  </div>
                </div>

                <div className="address-info">
                  <span className="label">Address:</span>
                  <span className="value">{ambulance.address}</span>
                </div>

                <div className="rating-section">
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="star"
                        style={{
                          color: i < Math.round(ambulance.rating) ? '#FFA500' : '#ddd'
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-value">{ambulance.rating}</span>
                    <span className="reviews">({ambulance.review_count} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-call" onClick={() => window.location.href = `tel:${ambulance.phone_number}`}>
                  Call Now
                </button>
                <button className="btn-book">Request Ambulance</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <AlertCircle size={48} />
            <h3>No ambulances found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
