import { useState, useEffect } from 'react';
import { PhoneCall, MapPin, DollarSign, AlertCircle, X } from 'lucide-react';
import Pagination from '../components/Pagination';
import { ambulanceAPI } from '../api/ambulance';
import Payment from '../components/Payment';
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [ambulanceRequestData, setAmbulanceRequestData] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_phone: '',
    pickup_location: '',
    pickup_address: '',
    dropoff_location: '',
    vehicle_type_required: 'basic',
    urgency: 'normal',
    required_date: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      let allAmbulances = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages from backend API (which uses 20-item pagination)
      while (hasMore) {
        const response = await ambulanceAPI.listServices({ page });
        const data = response.data;
        
        if (data.results) {
          allAmbulances = [...allAmbulances, ...data.results];
          // Check if there are more pages
          hasMore = !!data.next;
          page++;
        } else if (Array.isArray(data)) {
          allAmbulances = data;
          hasMore = false;
        } else {
          allAmbulances = data;
          hasMore = false;
        }
      }
      
      setAmbulances(allAmbulances);
      setFilteredAmbulances(allAmbulances);
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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(amb =>
        String(amb.name || '').toLowerCase().includes(query) ||
        String(amb.driver_name || '').toLowerCase().includes(query) ||
        String(amb.phone_number || '').includes(searchQuery)
      );
    }

    setFilteredAmbulances(filtered);
    setCurrentPage(1);
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

  const handleOpenRequestModal = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setFormData(prev => ({
      ...prev,
      vehicle_type_required: ambulance.vehicle_type,
    }));
    setShowRequestModal(true);
    setRequestError('');
    setRequestSuccess('');
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setSelectedAmbulance(null);
    setFormData({
      patient_name: '',
      contact_phone: '',
      pickup_location: '',
      pickup_address: '',
      dropoff_location: '',
      vehicle_type_required: 'basic',
      urgency: 'normal',
      required_date: new Date().toISOString().slice(0, 16),
      notes: '',
    });
    setRequestError('');
    setRequestSuccess('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccess('');
    setRequestLoading(true);

    // Validate required fields
    if (!formData.patient_name.trim() || !formData.contact_phone.trim() || 
        !formData.pickup_location.trim() || !formData.pickup_address.trim() ||
        !formData.dropoff_location.trim()) {
      setRequestError('Please fill in all required fields');
      setRequestLoading(false);
      return;
    }

    // Validate phone number (basic validation)
    if (!/^\+?[\d\s\-()]{10,}$/.test(formData.contact_phone)) {
      setRequestError('Please enter a valid phone number');
      setRequestLoading(false);
      return;
    }

    try {
      // Convert required_date to ISO format
      const requiredDateTime = new Date(formData.required_date).toISOString();
      
      const requestData = {
        ...formData,
        required_date: requiredDateTime,
      };

      const response = await ambulanceAPI.createRequest(requestData);
      
      setAmbulanceRequestData(response.data || response);
      setRequestSuccess('Ambulance request submitted successfully! You will receive confirmation shortly.');
      
      // Show payment modal after 2 seconds
      setTimeout(() => {
        setShowPayment(true);
      }, 2000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setRequestError(
        err.response?.data?.message || 
        err.message || 
        'Failed to submit ambulance request. Please try again.'
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Update ambulance request with payment reference
      await ambulanceAPI.updateRequest(ambulanceRequestData.id, {
        payment_status: 'paid',
        payment: paymentData.id,
      });
      
      setShowPayment(false);
      
      // Close modal after a moment
      setTimeout(() => {
        handleCloseRequestModal();
      }, 1500);
    } catch (err) {
      console.error('Error updating ambulance request after payment:', err);
      setRequestError('Payment successful but failed to update request. Please contact support.');
    }
  };

  const handleCallNow = (phoneNumber) => {
    // Try to detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use tel: protocol to initiate call
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // On desktop, copy to clipboard and show alert
      navigator.clipboard.writeText(phoneNumber).then(() => {
        alert(`Phone number copied to clipboard: ${phoneNumber}\n\nYou can now dial it manually.`);
      }).catch(() => {
        // Fallback if clipboard API fails
        alert(`Call this number: ${phoneNumber}`);
      });
    }
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
          filteredAmbulances
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map(ambulance => (
            <div key={ambulance.id} className="ambulance-card">
              <div className="ambulance-image">
                <img 
                  src={ambulance.image_url || "https://images.unsplash.com/photo-1586854692186-e5b8a9dbbd16?w=400&h=300&fit=crop"} 
                  alt={ambulance.name || 'Ambulance service'}
                  onError={(e) => e.target.src = "https://images.unsplash.com/photo-1586854692186-e5b8a9dbbd16?w=400&h=300&fit=crop"}
                />
                {ambulance.is_verified && <div className="badge">Verified</div>}
              </div>
              <div className="ambulance-header">
                <div className="ambulance-name-section">
                  <h3>{ambulance.name || 'Ambulance Service'}</h3>
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
                    <span className="value">{ambulance.driver_name || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <PhoneCall size={16} />
                    <span className="label">Contact:</span>
                    <span className="value">{ambulance.phone_number || 'Not provided'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span className="label">Location:</span>
                    <span className="value">{ambulance.district_name || 'Location not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span className="label">Rate:</span>
                    <span className="value">BDT {ambulance.cost_per_km || '0.00'}/km</span>
                  </div>
                </div>

                <div className="address-info">
                  <span className="label">Address:</span>
                  <span className="value">{ambulance.address || 'Address not provided'}</span>
                </div>

                <div className="rating-section">
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="star"
                        style={{
                          color: i < Math.round(Number(ambulance.rating) || 0) ? '#FFA500' : '#ddd'
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-value">{ambulance.rating || '0.0'}</span>
                    <span className="reviews">({ambulance.review_count || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-call" 
                  onClick={() => handleCallNow(ambulance.phone_number)}
                  disabled={!ambulance.phone_number}
                >
                  Call Now
                </button>
                <button 
                  className="btn-book"
                  onClick={() => handleOpenRequestModal(ambulance)}
                  disabled={!ambulance.is_available}
                >
                  Request Ambulance
                </button>
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

      {filteredAmbulances.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredAmbulances.length / ITEMS_PER_PAGE)}
          totalItems={filteredAmbulances.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Request Ambulance Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={handleCloseRequestModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Ambulance Service</h2>
              <button className="btn-close" onClick={handleCloseRequestModal}>
                <X size={24} />
              </button>
            </div>

            {selectedAmbulance && (
              <div className="selected-ambulance-info">
                <p><strong>Selected Ambulance:</strong> {selectedAmbulance.name}</p>
                <p><strong>Type:</strong> {getVehicleTypeLabel(selectedAmbulance.vehicle_type)}</p>
                <p><strong>Rate:</strong> BDT {selectedAmbulance.cost_per_km}/km</p>
              </div>
            )}

            {requestSuccess && (
              <div className="alert alert-success">
                <AlertCircle size={20} />
                {requestSuccess}
                {ambulanceRequestData && (
                  <button 
                    type="button"
                    onClick={() => setShowPayment(true)}
                    style={{ 
                      marginTop: '1rem',
                      padding: '10px 20px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Proceed to Payment
                  </button>
                )}
              </div>
            )}

            {requestError && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                {requestError}
              </div>
            )}

            <form className="ambulance-request-form" onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label htmlFor="patient_name">Patient Name *</label>
                <input
                  type="text"
                  id="patient_name"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleFormChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">Contact Phone *</label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number (e.g., +880 1700000000)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickup_location">Pickup Location Name *</label>
                <input
                  type="text"
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleFormChange}
                  placeholder="e.g., City Hospital, Clinic XYZ"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickup_address">Pickup Address *</label>
                <textarea
                  id="pickup_address"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleFormChange}
                  placeholder="Enter detailed pickup address"
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="dropoff_location">Dropoff Location Name *</label>
                <input
                  type="text"
                  id="dropoff_location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleFormChange}
                  placeholder="e.g., Home, Hospital Name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vehicle_type_required">Vehicle Type</label>
                  <select
                    id="vehicle_type_required"
                    name="vehicle_type_required"
                    value={formData.vehicle_type_required}
                    onChange={handleFormChange}
                  >
                    <option value="basic">Basic Ambulance</option>
                    <option value="advanced">Advanced Life Support</option>
                    <option value="icu">ICU Ambulance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleFormChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="required_date">Required Date & Time</label>
                <input
                  type="datetime-local"
                  id="required_date"
                  name="required_date"
                  value={formData.required_date}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Any special requirements or medical information..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseRequestModal}
                  disabled={requestLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={requestLoading}
                >
                  {requestLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal for Ambulance Service */}
      {showPayment && ambulanceRequestData && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="ambulance"
          amount={ambulanceRequestData.estimated_fare || 100}
          referenceId={ambulanceRequestData.id}
          referenceType="ambulance_request"
          serviceName={`Ambulance Service - ${selectedAmbulance?.name || 'Standard'}`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
