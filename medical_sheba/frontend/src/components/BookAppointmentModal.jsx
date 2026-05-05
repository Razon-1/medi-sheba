import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../api/appointments';
import useAuthStore from '../context/authStore';
import '../styles/components/BookAppointmentModal.css';

export default function BookAppointmentModal({ doctor, isOpen, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    type: 'new',
    symptoms: '',
    notes: '',
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

    // Validate required fields
    if (!formData.appointment_date || !formData.appointment_time) {
      setError('Please select both date and time for your appointment');
      return;
    }

    try {
      setLoading(true);
      
      const appointmentData = {
        doctor_id: doctor.id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        type: formData.type,
        fee_amount: parseFloat(doctor.consultation_fee) || 0,
      };

      // Add optional fields if they have values
      if (formData.symptoms && formData.symptoms.trim()) {
        appointmentData.symptoms = formData.symptoms;
      }
      if (formData.notes && formData.notes.trim()) {
        appointmentData.notes = formData.notes;
      }

      console.log('Booking appointment with data:', appointmentData);
      
      const response = await appointmentsAPI.create(appointmentData);
      
      console.log('Appointment created successfully:', response.data);
      
      setSuccess(true);
      setFormData({
        appointment_date: '',
        appointment_time: '',
        type: 'new',
        symptoms: '',
        notes: '',
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess(response.data);
        }
      }, 2000);

    } catch (err) {
      console.error('Error booking appointment:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to book appointment. Please try again.';
      
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
          // Try to extract first error message from object
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
          <h2>Book Appointment</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <CheckCircle size={48} color="#10B981" />
              <h3>Appointment Booked Successfully!</h3>
              <p>Your appointment has been scheduled. You will receive a confirmation shortly.</p>
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
                  <p className="fee">Fee: BDT {doctor.consultation_fee}</p>
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
                    <label htmlFor="appointment_date">Appointment Date *</label>
                    <input
                      type="date"
                      id="appointment_date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="appointment_time">Appointment Time *</label>
                    <input
                      type="time"
                      id="appointment_time"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

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
                    <label htmlFor="symptoms">Symptoms</label>
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="Describe your symptoms..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Additional Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional information for the doctor..."
                      rows="3"
                    />
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
                      {loading ? 'Booking...' : 'Confirm Appointment'}
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
