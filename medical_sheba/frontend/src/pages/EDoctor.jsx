import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import { edoctorAPI } from '../api/edoctor';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/EDoctor.css';

export default function EDoctor() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.edoctor || { 
    title: 'E-Doctor | Medi Sheba', 
    description: 'Consult with qualified doctors online' 
  });
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    patient_age: '',
    chief_complaint: '',
    medical_history: '',
    scheduled_date: '',
    scheduled_time: '',
    urgency: 'routine'
  });

  useEffect(() => {
    fetchDoctors();
    fetchConsultations();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await edoctorAPI.listDoctors();
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

  const fetchConsultations = async () => {
    try {
      const response = await edoctorAPI.listConsultations();
      const data = response.data.results || response.data;
      setConsultations(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const handleSearch = () => {
    let filtered = doctors;

    // Apply specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter(doc => doc.specialization === filterSpecialization);
    }

    // Apply verified only filter
    if (verifiedOnly) {
      filtered = filtered.filter(doc => doc.is_verified);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [filterSpecialization, verifiedOnly]);

  const getSpecializationLabel = (spec) => {
    const labels = {
      'general': 'General Practitioner',
      'cardiology': 'Cardiology',
      'neurology': 'Neurology',
      'pediatrics': 'Pediatrics',
      'orthopedics': 'Orthopedics',
      'dermatology': 'Dermatology',
      'psychiatry': 'Psychiatry',
      'gynecology': 'Gynecology',
      'urology': 'Urology',
      'ophthalmology': 'Ophthalmology',
      'ent': 'ENT',
      'dentistry': 'Dentistry',
    };
    return labels[spec] || spec;
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !bookingData.patient_name || !bookingData.chief_complaint) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await edoctorAPI.createConsultation({
        ...bookingData,
        doctor: selectedDoctor.id
      });
      alert('Consultation booked successfully!');
      setShowBookingForm(false);
      setBookingData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        patient_age: '',
        chief_complaint: '',
        medical_history: '',
        scheduled_date: '',
        scheduled_time: '',
        urgency: 'routine'
      });
      fetchConsultations();
    } catch (err) {
      console.error('Error booking consultation:', err);
      alert('Failed to book consultation');
    }
  };

  return (
    <div className="edoctor-container">
      <div className="edoctor-header">
        <h1>Online Doctor Consultation</h1>
        <p>Connect with experienced doctors for online medical consultation</p>
      </div>

      {/* Tab Navigation */}
      <div className="edoctor-tabs">
        <button 
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          👨‍⚕️ Doctors
        </button>
        <button 
          className={`tab-button ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultations')}
        >
          📋 My Consultations
        </button>
      </div>

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="edoctor-content">
          {/* Search and Filter Section */}
          <div className="edoctor-search-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={handleSearch}>Search</button>
            </div>

            <div className="filter-section">
              <h3>Filter by Specialization:</h3>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${!filterSpecialization ? 'active' : ''}`}
                  onClick={() => setFilterSpecialization('')}
                >
                  All Specializations
                </button>
                <button 
                  className={`filter-btn ${filterSpecialization === 'general' ? 'active' : ''}`}
                  onClick={() => setFilterSpecialization('general')}
                >
                  General
                </button>
                <button 
                  className={`filter-btn ${filterSpecialization === 'cardiology' ? 'active' : ''}`}
                  onClick={() => setFilterSpecialization('cardiology')}
                >
                  Cardiology
                </button>
                <button 
                  className={`filter-btn ${filterSpecialization === 'pediatrics' ? 'active' : ''}`}
                  onClick={() => setFilterSpecialization('pediatrics')}
                >
                  Pediatrics
                </button>
                <button 
                  className={`filter-btn ${filterSpecialization === 'gynecology' ? 'active' : ''}`}
                  onClick={() => setFilterSpecialization('gynecology')}
                >
                  Gynecology
                </button>
              </div>

              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span>Verified Doctors Only</span>
              </label>
            </div>
          </div>

          <p className="results-count">
            Showing <strong>{filteredDoctors.length}</strong> doctor(s) available
          </p>

          {/* Doctors List */}
          {loading ? (
            <h3>Loading doctors...</h3>
          ) : error ? (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={fetchDoctors}>Try Again</button>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="doctors-list">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-header">
                    <div className="doctor-basic">
                      <h3>{doctor.name}</h3>
                      <span className="specialization">{getSpecializationLabel(doctor.specialization)}</span>
                    </div>
                    {doctor.is_verified && <span className="verified-badge">✓ Verified</span>}
                  </div>

                  <div className="doctor-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <Clock size={16} />
                        <span><strong>Experience:</strong> {doctor.experience_years} years</span>
                      </div>
                      <div className="detail-item">
                        <span><strong>Fee:</strong> BDT {parseFloat(doctor.consultation_fee).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <Phone size={16} />
                        <span><strong>Contact:</strong> {doctor.phone_number}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span><strong>Hospital:</strong> {doctor.hospital_name}</span>
                      </div>
                    </div>

                    {doctor.hospital_name && (
                      <div className="detail-row">
                        <span><strong>Address:</strong> {doctor.consultation_address}</span>
                      </div>
                    )}

                    <div className="rating-section">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star">★</span>
                        ))}
                      </div>
                      <span className="rating-value">{doctor.rating}</span>
                      <span className="review-count">({doctor.review_count} reviews)</span>
                    </div>
                  </div>

                  <div className="doctor-actions">
                    <button 
                      className="btn-call"
                      onClick={() => window.location.href = `tel:${doctor.phone_number}`}
                    >
                      Call Now
                    </button>
                    <button 
                      className="btn-book"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBookingForm(true);
                      }}
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No doctors found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Consultations Tab */}
      {activeTab === 'consultations' && (
        <div className="edoctor-content">
          <h2>Your Consultations</h2>
          {consultations.length > 0 ? (
            <div className="consultations-list">
              {consultations.map(consultation => (
                <div key={consultation.id} className="consultation-card">
                  <div className="consultation-header">
                    <h4>{consultation.consultation_id}</h4>
                    <span className={`status-badge status-${consultation.status}`}>
                      {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                  </div>
                  <div className="consultation-info">
                    <p><strong>Doctor:</strong> {consultation.doctor_name}</p>
                    <p><strong>Date:</strong> {consultation.scheduled_date}</p>
                    <p><strong>Time:</strong> {consultation.scheduled_time}</p>
                    <p><strong>Fee:</strong> BDT {parseFloat(consultation.fee_amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>You haven't booked any consultations yet</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedDoctor && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Consultation with {selectedDoctor.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowBookingForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  value={bookingData.patient_name}
                  onChange={(e) => setBookingData({...bookingData, patient_name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={bookingData.patient_email}
                    onChange={(e) => setBookingData({...bookingData, patient_email: e.target.value})}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={bookingData.patient_phone}
                    onChange={(e) => setBookingData({...bookingData, patient_phone: e.target.value})}
                    placeholder="+880-1700-000000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={bookingData.patient_age}
                  onChange={(e) => setBookingData({...bookingData, patient_age: e.target.value})}
                  placeholder="Age"
                />
              </div>

              <div className="form-group">
                <label>Chief Complaint *</label>
                <textarea
                  value={bookingData.chief_complaint}
                  onChange={(e) => setBookingData({...bookingData, chief_complaint: e.target.value})}
                  placeholder="What is your main health concern?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Medical History</label>
                <textarea
                  value={bookingData.medical_history}
                  onChange={(e) => setBookingData({...bookingData, medical_history: e.target.value})}
                  placeholder="Any previous medical conditions or current medications?"
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingData.scheduled_date}
                    onChange={(e) => setBookingData({...bookingData, scheduled_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time *</label>
                  <input
                    type="time"
                    value={bookingData.scheduled_time}
                    onChange={(e) => setBookingData({...bookingData, scheduled_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Urgency</label>
                <select
                  value={bookingData.urgency}
                  onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-submit"
                  onClick={handleBookConsultation}
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
