import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import { edoctorAPI } from '../api/edoctor';
import paymentsAPI from '../api/payments';
import Payment from '../components/Payment';
import { useSEO, pageMetadata } from '../utils/seo';
import useAuthStore from '../context/authStore';
import '../styles/pages/EDoctor.css';

export default function EDoctor() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.edoctor || { 
    title: 'E-Doctor | Medi Sheba', 
    description: 'Consult with qualified doctors online' 
  });
  
  const { user } = useAuthStore();
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchDoctors();
    // Only fetch consultations if user is authenticated
    if (user) {
      fetchConsultations();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let allDoctors = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages from backend API (which uses 20-item pagination)
      while (hasMore) {
        const response = await edoctorAPI.listDoctors({ page });
        const data = response.data;
        
        if (data.results) {
          allDoctors = [...allDoctors, ...data.results];
          // Check if there are more pages
          hasMore = !!data.next;
          page++;
        } else if (Array.isArray(data)) {
          allDoctors = data;
          hasMore = false;
        } else {
          allDoctors = data;
          hasMore = false;
        }
      }
      
      setDoctors(allDoctors);
      setFilteredDoctors(allDoctors);
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

  const fetchAvailableSlots = async (doctorId) => {
    try {
      setSlotsLoading(true);
      const response = await edoctorAPI.listSlots({ doctor: doctorId });
      const slots = response.data.results || response.data;
      setAvailableSlots(slots);

      // Extract unique dates from slots
      const datesSet = new Set();
      slots.forEach(slot => {
        const date = new Date(slot.start_time).toISOString().split('T')[0];
        if (date) datesSet.add(date);
      });
      
      const sortedDates = Array.from(datesSet).sort();
      setAvailableDates(sortedDates);
      setBookingData(prev => ({ ...prev, scheduled_date: '', scheduled_time: '' }));
      setAvailableTimes([]);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
      setAvailableDates([]);
      setAvailableTimes([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setBookingData(prev => ({ ...prev, scheduled_date: selectedDate, scheduled_time: '' }));

    // Filter times for selected date
    const timesForDate = availableSlots
      .filter(slot => {
        const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
        return slotDate === selectedDate && slot.status === 'available';
      })
      .map(slot => {
        const startTime = new Date(slot.start_time);
        const endTime = new Date(slot.end_time);
        const hours = String(startTime.getHours()).padStart(2, '0');
        const minutes = String(startTime.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        return {
          time: timeStr,
          slotId: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time
        };
      });

    setAvailableTimes(timesForDate);
  };

  const handleSearch = () => {
    let filtered = doctors;

    // Apply specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter(doc => doc.specialization === filterSpecialization);
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
    setCurrentPage(1);
  };

  useEffect(() => {
    handleSearch();
  }, [filterSpecialization]);

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
    if (!selectedDoctor || !bookingData.patient_name || !bookingData.chief_complaint || !bookingData.scheduled_date || !bookingData.scheduled_time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await edoctorAPI.createConsultation({
        ...bookingData,
        doctor: selectedDoctor.id
      });
      
      // Show confirmation with booking details
      setBookingConfirmation({
        id: response.data.id,
        consultation_id: response.data.consultation_id,
        doctor_name: selectedDoctor.name,
        patient_name: bookingData.patient_name,
        scheduled_date: bookingData.scheduled_date,
        scheduled_time: bookingData.scheduled_time,
        chief_complaint: bookingData.chief_complaint,
        fee: selectedDoctor.consultation_fee,
        status: 'confirmed'
      });
      
      fetchConsultations();
    } catch (err) {
      console.error('Error booking consultation:', err);
      alert('Failed to book consultation');
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Update consultation with payment reference
      await edoctorAPI.updateConsultation(bookingConfirmation.id, {
        payment_status: 'paid',
        payment: paymentData.id,
      });
      
      setShowPayment(false);
      
      // Close confirmation modal after a moment
      setTimeout(() => {
        setBookingConfirmation(null);
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
      }, 1500);
    } catch (err) {
      console.error('Error updating consultation after payment:', err);
      alert('Payment successful but failed to update consultation. Please contact support.');
    }
  };

  return (
    <div className="edoctor-container">
      <div className="edoctor-header">
        <h1>Online Doctor Consultation</h1>
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

            </div>
          </div>

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
              {filteredDoctors
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-image">
                    <img 
                      src={doctor.image_url || "https://images.unsplash.com/photo-1612349317150-e716f8a01751?w=300&h=300&fit=crop"} 
                      alt={doctor.name}
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1612349317150-e716f8a01751?w=300&h=300&fit=crop"}
                    />
                  </div>
                  <div className="doctor-header">
                    <div className="doctor-basic">
                      <h3>{doctor.name}</h3>
                      <span className="specialization">{getSpecializationLabel(doctor.specialization)}</span>
                    </div>
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

                    <div className="availability-info">
                      <div className="availability-times">
                        <strong>⏰ Available Time:</strong>
                        <span>{doctor.available_start_time && doctor.available_end_time ? `${doctor.available_start_time} - ${doctor.available_end_time}` : 'Check with hospital'}</span>
                      </div>
                      <div className="contact-for-serial">
                        <strong>📞 How it works:</strong>
                        <p>Contact for serial at {doctor.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-actions">
                    <button 
                      className="btn-book"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBookingForm(true);
                        fetchAvailableSlots(doctor.id);
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

          {filteredDoctors.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)}
              totalItems={filteredDoctors.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
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
                  {slotsLoading ? (
                    <p style={{ color: '#999', fontSize: '14px' }}>Loading available dates...</p>
                  ) : availableDates.length > 0 ? (
                    <select
                      value={bookingData.scheduled_date}
                      onChange={(e) => handleDateChange(e.target.value)}
                    >
                      <option value="">Select a date</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p style={{ color: '#e74c3c', fontSize: '14px' }}>No available dates</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Preferred Time *</label>
                  {bookingData.scheduled_date && availableTimes.length > 0 ? (
                    <select
                      value={bookingData.scheduled_time}
                      onChange={(e) => setBookingData({...bookingData, scheduled_time: e.target.value})}
                    >
                      <option value="">Select a time</option>
                      {availableTimes.map(timeSlot => (
                        <option key={timeSlot.slotId} value={timeSlot.time}>
                          {timeSlot.time}
                        </option>
                      ))}
                    </select>
                  ) : bookingData.scheduled_date ? (
                    <p style={{ color: '#e74c3c', fontSize: '14px' }}>No available times for this date</p>
                  ) : (
                    <p style={{ color: '#999', fontSize: '14px' }}>Select a date first</p>
                  )}
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

      {/* Booking Confirmation Modal */}
      {bookingConfirmation && (
        <div className="booking-modal-overlay" onClick={() => {
          setBookingConfirmation(null);
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
        }}>
          <div className="booking-modal confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-icon">✓</div>
            <h2 style={{ color: '#27ae60', textAlign: 'center' }}>Consultation Booked Successfully!</h2>
            
            <div className="confirmation-details">
              <div className="detail-item">
                <span className="label">Consultation ID:</span>
                <span className="value">{bookingConfirmation.consultation_id}</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Doctor:</span>
                <span className="value">{bookingConfirmation.doctor_name}</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Patient Name:</span>
                <span className="value">{bookingConfirmation.patient_name}</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Scheduled Date:</span>
                <span className="value">
                  {new Date(bookingConfirmation.scheduled_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="label">Scheduled Time:</span>
                <span className="value">{bookingConfirmation.scheduled_time}</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Chief Complaint:</span>
                <span className="value">{bookingConfirmation.chief_complaint}</span>
              </div>
              
              <div className="detail-item">
                <span className="label">Consultation Fee:</span>
                <span className="value">BDT {parseFloat(bookingConfirmation.fee).toFixed(2)}</span>
              </div>

              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value" style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  {bookingConfirmation.status.charAt(0).toUpperCase() + bookingConfirmation.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-submit"
                onClick={() => setShowPayment(true)}
                style={{ backgroundColor: '#3498db', marginRight: '10px' }}
              >
                Proceed to Payment - BDT {parseFloat(bookingConfirmation.fee).toFixed(2)}
              </button>
              <button 
                className="btn-submit"
                onClick={() => {
                  setBookingConfirmation(null);
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
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for E-Doctor Consultation */}
      {showPayment && bookingConfirmation && (
        <Payment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentType="edoctor"
          amount={parseFloat(bookingConfirmation.fee)}
          referenceId={bookingConfirmation.id}
          referenceType="edoctor_consultation"
          serviceName={`E-Doctor Consultation with ${bookingConfirmation.doctor_name}`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
