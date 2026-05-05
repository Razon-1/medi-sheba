import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../api/appointments';
import useAuthStore from '../context/authStore';
import '../styles/components/BookAppointmentModal.css';

export default function BookAppointmentModal({ doctor, isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'new',
    message: '', // Patient's preferred time or symptoms
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check if user is logged in when modal opens
  useEffect(() => {
    if (isOpen && !user) {
      setError('Please log in to book an appointment');
    } else {
      setError(null);
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate authentication
    if (!user || !user.id) {
      setError('Please log in to book an appointment');
      return;
    }

    // Validate message
    if (!formData.message || !formData.message.trim()) {
      setError('Please provide your preferred appointment time or describe your medical concern');
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        doctor_id: doctor.id,
        type: formData.type,
        symptoms: formData.message, // Store message in symptoms field
        notes: 'Pending phone confirmation - patient request',
        fee_amount: parseFloat(doctor.consultation_fee) || 0,
      };

      console.log('Submitting appointment request:', appointmentData);
      
      const response = await appointmentsAPI.create(appointmentData);
      
      console.log('Appointment created successfully:', response);
      
      setSuccess(true);
      setFormData({
        type: 'new',
        message: '',
      });

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess(response);
        }
      }, 3000);

    } catch (err) {
      console.error('Error booking appointment:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to submit appointment request. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0] || errorMessage;
        } else if (typeof err.response.data === 'object') {
          const firstKey = Object.keys(err.response.data)[0];
          if (firstKey && err.response.data[firstKey]) {
            const fieldError = err.response.data[firstKey];
            errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Appointment</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <CheckCircle size={48} color="#10B981" />
              <h3>Request Submitted Successfully! 🎉</h3>
              <p>Thank you for your appointment request!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#666' }}>
                We will call you to confirm the exact date and time that works best for you.
              </p>
            </div>
          ) : (
            <>
              <div className="doctor-summary">
                <img 
                  src="https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=80&h=80&fit=crop" 
                  alt={doctor.user_name}
                  className="doctor-thumbnail"
                />
                <div className="doctor-summary-info">
                  <h4>Dr. {doctor.user_name || doctor.name}</h4>
                  <p className="specialty">{doctor.specialty}</p>
                  <p className="fee">Consultation Fee: BDT {doctor.consultation_fee}</p>
                </div>
              </div>

              {/* Doctor Availability Section */}
              <div className="availability-section">
                <div className="availability-card">
                  <Calendar size={20} className="icon" />
                  <div className="availability-info">
                    <strong>Available Days:</strong>
                    <p>{doctor.available_days ? doctor.available_days.split(',').map(d => d.trim()).join(', ') : 'Check with hospital'}</p>
                  </div>
                </div>
                <div className="availability-card">
                  <Clock size={20} className="icon" />
                  <div className="availability-info">
                    <strong>Available Time:</strong>
                    <p>{doctor.available_time_start && doctor.available_time_end ? `${doctor.available_time_start.substring(0, 5)} - ${doctor.available_time_end.substring(0, 5)}` : 'Check with hospital'}</p>
                  </div>
                </div>
              </div>

              {/* Phone Confirmation Notice */}
              <div className="phone-notice">
                <Phone size={18} className="icon" />
                <div>
                  <strong>How it works:</strong>
                  <p>Share your preferred time or medical concern, and our team will call you to confirm the appointment.</p>
                </div>
              </div>

              {error && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <div className="error-content">
                    <span>{error}</span>
                    {!user && (
                      <button 
                        type="button"
                        className="btn-login-prompt"
                        onClick={handleLoginClick}
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              )}

              {user && (
                <form onSubmit={handleSubmit} className="appointment-form">
                  <div className="form-group">
                    <label htmlFor="type">Appointment Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="new">New Consultation</option>
                      <option value="follow_up">Follow-up Consultation</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Your Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us your preferred time (e.g., 'Monday 10 AM' or 'Afternoon') or describe your medical concern and symptoms..."
                      rows="4"
                      required
                    />
                    <small>Please mention your preferred time or describe your symptoms so we can schedule appropriately.</small>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-confirm" 
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Request Appointment'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
