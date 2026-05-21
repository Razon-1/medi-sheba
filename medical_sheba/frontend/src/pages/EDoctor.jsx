import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import { edoctorAPI } from '../api/edoctor';
import paymentsAPI from '../api/payments';
import { useSEO, pageMetadata } from '../utils/seo';
import useAuthStore from '../context/authStore';
import { resolveImageUrl } from '../utils/images';
import '../styles/pages/EDoctor.css';

const formatAvailabilitySchedule = (doctor) => {
  if (Array.isArray(doctor.availability_schedule) && doctor.availability_schedule.length > 0) {
    const scheduleText = doctor.availability_schedule
      .filter((item) => item.day)
      .map((item) => {
        const slots = Array.isArray(item.slots) && item.slots.length > 0
          ? item.slots
          : [{ start_time: item.start_time, end_time: item.end_time }];
        const slotText = slots
          .filter((slot) => slot.start_time && slot.end_time)
          .map((slot) => `${String(slot.start_time).slice(0, 5)} - ${String(slot.end_time).slice(0, 5)}`)
          .join(', ');
        return slotText ? `${item.day}: ${slotText}` : '';
      })
      .filter(Boolean)
      .join(', ');

    if (scheduleText) return scheduleText;
  }

  if (doctor.available_start_time && doctor.available_end_time) {
    const days = doctor.available_days ? `${doctor.available_days}: ` : '';
    return `${days}${doctor.available_start_time} - ${doctor.available_end_time}`;
  }

  return 'Check with hospital';
};

const getAvailabilitySchedule = (doctor) => {
  if (Array.isArray(doctor?.availability_schedule) && doctor.availability_schedule.length > 0) {
    return doctor.availability_schedule
      .map((item) => ({
        day: item.day,
        slots: Array.isArray(item.slots) && item.slots.length > 0
          ? item.slots
          : [{ start_time: item.start_time, end_time: item.end_time }],
      }))
      .filter((item) => item.day && item.slots.some((slot) => slot.start_time && slot.end_time));
  }

  if (doctor?.available_days && doctor?.available_start_time && doctor?.available_end_time) {
    return doctor.available_days
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean)
      .map((day) => ({
        day,
        slots: [{ start_time: doctor.available_start_time, end_time: doctor.available_end_time }],
      }));
  }

  return [];
};

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextScheduleDates = (schedule, limit = 8, daysAhead = 60) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const availableDays = new Set(schedule.map((item) => item.day.toLowerCase()));
  const dates = [];

  for (let offset = 0; offset < daysAhead && dates.length < limit; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (availableDays.has(weekday)) {
      dates.push(formatDateValue(date));
    }
  }

  return dates;
};

const formatSlotDateLabel = (date) => (
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
);

const getScheduleTimesForDate = (schedule, selectedDate) => {
  if (!selectedDate) return [];
  const weekday = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = schedule.find((item) => item.day.toLowerCase() === weekday);
  if (!daySchedule) return [];

  return daySchedule.slots
    .filter((slot) => slot.start_time && slot.end_time)
    .map((slot, index) => ({
      time: String(slot.start_time).slice(0, 5),
      slotId: `${selectedDate}-${index}`,
      startTime: slot.start_time,
      endTime: slot.end_time,
    }));
};

const getStoredSlotTimesForDate = (slots, selectedDate) => (
  slots
    .filter(slot => {
      const slotDate = new Date(slot.start_time).toISOString().split('T')[0];
      return slotDate === selectedDate && slot.status === 'available';
    })
    .map(slot => {
      const startTime = new Date(slot.start_time);
      const hours = String(startTime.getHours()).padStart(2, '0');
      const minutes = String(startTime.getMinutes()).padStart(2, '0');
      return {
        time: `${hours}:${minutes}`,
        slotId: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
      };
    })
);

const getScheduleSlotOptions = (schedule) => (
  getNextScheduleDates(schedule).flatMap((date) => (
    getScheduleTimesForDate(schedule, date).map((slot) => ({
      value: `${date}|${slot.time}`,
      date,
      time: slot.time,
      label: `${formatSlotDateLabel(date)} - ${slot.endTime ? `${slot.time} - ${String(slot.endTime).slice(0, 5)}` : slot.time}`,
    }))
  ))
);

const getStoredSlotOptions = (slots) => (
  slots
    .filter((slot) => slot.status === 'available')
    .map((slot) => {
      const date = new Date(slot.start_time).toISOString().split('T')[0];
      const [timeSlot] = getStoredSlotTimesForDate([slot], date);
      return timeSlot ? {
        value: `${date}|${timeSlot.time}`,
        date,
        time: timeSlot.time,
        label: `${formatSlotDateLabel(date)} - ${timeSlot.endTime ? `${timeSlot.time} - ${String(timeSlot.endTime).slice(0, 5)}` : timeSlot.time}`,
      } : null;
    })
    .filter(Boolean)
);

const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (err.detail) return err.detail;
  if (err.response?.data?.detail) return err.response.data.detail;
  if (err.response?.data?.error) return err.response.data.error;

  const data = err.response?.data || err;
  if (data?.gateway_response?.failedreason) return data.gateway_response.failedreason;
  if (typeof data === 'object') {
    const fieldError = Object.entries(data)
      .filter(([key]) => key !== 'gateway_response')
      .map(([, value]) => {
        const message = Array.isArray(value)
          ? value.map((item) => (typeof item === 'object' ? Object.values(item).flat().join(', ') : String(item))).join(', ')
          : typeof value === 'object'
            ? Object.values(value).flat().join(', ')
            : String(value);
        return message;
      })
      .join(' ');

    if (fieldError) return fieldError;
  }

  if (err.message) return err.message;

  return fallback;
};

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
  const ITEMS_PER_PAGE = 15;
  const doctorFallbackImage = "https://images.unsplash.com/photo-1612349317150-e716f8a01751?w=300&h=300&fit=crop";
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
  const [availableSlotOptions, setAvailableSlotOptions] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingPaymentStarting, setBookingPaymentStarting] = useState(false);
  const [bookingError, setBookingError] = useState('');

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

  const fetchAvailableSlots = async (doctor) => {
    try {
      setSlotsLoading(true);
      const schedule = getAvailabilitySchedule(doctor);
      if (schedule.length > 0) {
        const slotOptions = getScheduleSlotOptions(schedule);
        const firstOption = slotOptions[0];
        setAvailableSlotOptions(slotOptions);
        setBookingData(prev => ({
          ...prev,
          scheduled_date: firstOption?.date || '',
          scheduled_time: firstOption?.time || '',
        }));
        return;
      }

      const doctorId = doctor?.id || doctor;
      const response = await edoctorAPI.listSlots({ doctor: doctorId });
      const slots = response.data.results || response.data;
      // Extract unique dates from slots
      const datesSet = new Set();
      slots.forEach(slot => {
        const date = new Date(slot.start_time).toISOString().split('T')[0];
        if (date) datesSet.add(date);
      });
      
      const sortedDates = Array.from(datesSet).sort();
      const slotOptions = getStoredSlotOptions(slots);
      const firstOption = slotOptions[0];
      setAvailableSlotOptions(slotOptions);
      setBookingData(prev => ({
        ...prev,
        scheduled_date: firstOption?.date || '',
        scheduled_time: firstOption?.time || '',
      }));
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlotOptions([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotChange = (value) => {
    const [scheduledDate, scheduledTime] = value.split('|');
    setBookingData({
      ...bookingData,
      scheduled_date: scheduledDate || '',
      scheduled_time: scheduledTime || '',
    });
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

  const startConsultationPayment = async (consultation) => {
    const amount = Number(consultation.fee_amount ?? consultation.fee ?? selectedDoctor?.consultation_fee);

    if (!amount || amount <= 0) {
      throw { detail: 'Consultation fee is missing, so SSLCommerz payment cannot start.' };
    }

    if (!consultation.id) {
      throw { detail: 'Consultation reference is missing, so SSLCommerz payment cannot start.' };
    }

    const checkoutResponse = await paymentsAPI.initiateSSLCommerzPayment({
      amount,
      payment_type: 'edoctor',
      reference_id: consultation.id,
      reference_type: 'edoctor_consultation',
    });
    const checkoutUrl = checkoutResponse.gateway_url || checkoutResponse.redirect_url || checkoutResponse.GatewayPageURL || checkoutResponse.redirectGatewayURL;

    if (!checkoutUrl) {
      throw { detail: 'SSLCommerz did not return a checkout URL.' };
    }

    window.location.href = checkoutUrl;
  };

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !bookingData.patient_name || !bookingData.chief_complaint || !bookingData.scheduled_date || !bookingData.scheduled_time) {
      setBookingError('Please fill in all required fields.');
      return;
    }

    setBookingError('');
    setBookingPaymentStarting(true);
    let consultation;

    try {
      const response = await edoctorAPI.createConsultation({
        ...bookingData,
        doctor: selectedDoctor.id
      });
      consultation = response.data;
    } catch (err) {
      console.error('Error booking consultation:', err);
      setBookingError(getErrorMessage(err, 'Failed to book consultation'));
      setBookingPaymentStarting(false);
      return;
    }

    fetchConsultations();

    try {
      await startConsultationPayment({ ...consultation, fee: selectedDoctor.consultation_fee });
    } catch (err) {
      console.error('Error starting consultation payment:', err);
      const paymentError = getErrorMessage(err, 'Payment could not start. Please try again.');
      setBookingPaymentStarting(false);
      setBookingConfirmation({
        id: consultation.id,
        consultation_id: consultation.consultation_id,
        doctor_name: selectedDoctor.name,
        patient_name: bookingData.patient_name,
        scheduled_date: bookingData.scheduled_date,
        scheduled_time: bookingData.scheduled_time,
        chief_complaint: bookingData.chief_complaint,
        fee: selectedDoctor.consultation_fee,
        status: consultation.status || 'scheduled',
        payment_error: paymentError
      });
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
              {filteredDoctors
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-image">
                    <img 
                      src={resolveImageUrl(doctor.image_url, doctorFallbackImage)} 
                      alt={doctor.name}
                      onError={(e) => e.target.src = doctorFallbackImage}
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
                        <strong>⏰ Available:</strong>
                        <span>{formatAvailabilitySchedule(doctor)}</span>
                      </div>
                    </div>

                    {false && (
                    <div className="rating-section">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star">★</span>
                        ))}
                      </div>
                      <span className="rating-value">{doctor.rating}</span>
                      <span className="review-count">({doctor.review_count} reviews)</span>
                    </div>
                    )}
                  </div>

                  <div className="doctor-actions">
                    <button 
                      className="btn-book"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBookingForm(true);
                        setBookingError('');
                        fetchAvailableSlots(doctor);
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
                aria-label="Close booking form"
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

              <div className="form-group">
                <label>Preferred Slot *</label>
                {slotsLoading ? (
                  <p style={{ color: '#999', fontSize: '14px' }}>Loading available slots...</p>
                ) : availableSlotOptions.length > 0 ? (
                  <select
                    value={bookingData.scheduled_date && bookingData.scheduled_time ? `${bookingData.scheduled_date}|${bookingData.scheduled_time}` : ''}
                    onChange={(e) => handleSlotChange(e.target.value)}
                  >
                    <option value="">Select preferred date and time</option>
                    {availableSlotOptions.map((slotOption) => (
                      <option key={slotOption.value} value={slotOption.value}>
                        {slotOption.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ color: '#e74c3c', fontSize: '14px' }}>No available slots</p>
                )}
              </div>

              <div className="form-group">
                <label>Urgency</label>
                <select
                  value={bookingData.urgency}
                  onChange={(e) => {
                    setBookingError('');
                    setBookingData({...bookingData, urgency: e.target.value});
                  }}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {bookingError && (
                <div className="booking-inline-error" role="alert">
                  {bookingError}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setBookingError('');
                    setShowBookingForm(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-submit"
                  onClick={handleBookConsultation}
                  disabled={bookingPaymentStarting}
                >
                  {bookingPaymentStarting ? 'Opening SSLCommerz...' : 'Book Consultation'}
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
            <h2 style={{ color: bookingConfirmation.payment_error ? '#c2410c' : '#27ae60', textAlign: 'center' }}>
              {bookingConfirmation.payment_error ? 'Payment Not Started' : 'Consultation Booked Successfully!'}
            </h2>
            
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

              {bookingConfirmation.payment_error && (
                <div className="detail-item payment-warning">
                  <span className="label">Payment:</span>
                  <span className="value">{bookingConfirmation.payment_error}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {bookingConfirmation.payment_error && (
                <button
                  className="btn-submit"
                  disabled={bookingPaymentStarting}
                  onClick={async () => {
                    try {
                      setBookingPaymentStarting(true);
                      await startConsultationPayment(bookingConfirmation);
                    } catch (err) {
                      console.error('Error retrying consultation payment:', err);
                      setBookingPaymentStarting(false);
                      setBookingConfirmation({
                        ...bookingConfirmation,
                        payment_error: getErrorMessage(err, 'Payment could not start. Please try again.')
                      });
                    }
                  }}
                >
                  {bookingPaymentStarting ? 'Opening SSLCommerz...' : 'Pay with SSLCommerz'}
                </button>
              )}
              {!bookingConfirmation.payment_error && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
