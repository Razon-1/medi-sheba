import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import { appointmentsAPI } from '../api/appointments';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Appointments.css';

export default function Appointments() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.appointments);
  
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.list();
      const data = response.data.results || response.data;
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Appointments</h1>
        </div>
      </div>

      <div className="appointments-list">
        {loading ? (
          <div className="no-results">
            <h3>Loading appointments...</h3>
          </div>
        ) : error ? (
          <div className="no-results">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchAppointments} className="btn-search">Retry</button>
          </div>
        ) : appointments.length > 0 ? (
          appointments.map(appointment => {
            const doctorName = appointment.doctor_name;
            const specialty = appointment.doctor?.specialty;
            const hospitalName = appointment.hospital?.name;
            
            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div className="doctor-info-header">
                    <img 
                      src="https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=100&h=100&fit=crop" 
                      alt={doctorName} 
                      className="doctor-avatar" 
                    />
                    <div className="doctor-info-text">
                      <h3>{doctorName}</h3>
                      <p className="specialty">{specialty}</p>
                    </div>
                  </div>
                  <span className={`status ${appointment.status}`}>
                    {getStatusDisplay(appointment.status)}
                  </span>
                </div>

                <div className="appointment-details">
                  <div className="detail-group">
                    <div className="detail-item">
                      <Calendar size={18} />
                      <div>
                        <span className="label">Date</span>
                        <span className="value">{new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Clock size={18} />
                      <div>
                        <span className="label">Time</span>
                        <span className="value">{appointment.appointment_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <div className="detail-item">
                      <MapPin size={18} />
                      <div>
                        <span className="label">Location</span>
                        <span className="value">{hospitalName}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Phone size={18} />
                      <div>
                        <span className="label">Fee</span>
                        <span className="value">BDT {appointment.fee_amount}</span>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="notes-section">
                      <span className="label">Notes</span>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <>
                      <button className="btn-reschedule">Confirm Appointment</button>
                      <button className="btn-cancel">Cancel</button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <>
                      <button className="btn-reschedule">Reschedule</button>
                      <button className="btn-cancel">Cancel Appointment</button>
                    </>
                  )}
                  {appointment.status === 'completed' && (
                    <>
                      <button className="btn-review">Leave Review</button>
                      <button className="btn-reschedule">Book Again</button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <h3>No appointments found</h3>
            <p>Book your first appointment with a doctor</p>
          </div>
        )}
      </div>
    </div>
  );
}
