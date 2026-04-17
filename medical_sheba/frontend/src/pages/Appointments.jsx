import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Appointments.css';

const sampleAppointments = [
  {
    id: 1,
    doctor_name: 'Dr. Ahmed Hasan',
    doctor_image: 'https://images.unsplash.com/photo-1622307479241-21e88c9cb8d8?w=100&h=100&fit=crop',
    specialty: 'Cardiologist',
    hospital_name: 'Apollo Hospital',
    date: '2026-04-25',
    time: '2:30 PM',
    status: 'scheduled',
    notes: 'Regular checkup'
  },
  {
    id: 2,
    doctor_name: 'Dr. Fatima Rahman',
    doctor_image: 'https://images.unsplash.com/photo-1594824476967-48c687c9d88e?w=100&h=100&fit=crop',
    specialty: 'Gynecologist',
    hospital_name: 'Square Hospital',
    date: '2026-05-02',
    time: '10:00 AM',
    status: 'scheduled',
    notes: 'Consultation'
  },
  {
    id: 3,
    doctor_name: 'Dr. Mohammad Karim',
    doctor_image: 'https://images.unsplash.com/photo-1607746882042-f3eed3e64e81?w=100&h=100&fit=crop',
    specialty: 'Orthopedic Surgeon',
    hospital_name: 'National Hospital',
    date: '2026-04-20',
    time: '3:00 PM',
    status: 'completed',
    notes: 'Follow-up visit'
  },
  {
    id: 4,
    doctor_name: 'Dr. Samina Begum',
    doctor_image: 'https://images.unsplash.com/photo-1559839734033-6461efb1b11a?w=100&h=100&fit=crop',
    specialty: 'Neurologist',
    hospital_name: 'Labaid Hospital',
    date: '2026-05-10',
    time: '4:30 PM',
    status: 'scheduled',
    notes: 'Initial consultation'
  },
];

export default function Appointments() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.appointments);
  
  return (
    <div className="appointments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Appointments</h1>
          <p>Manage and track your medical appointments</p>
        </div>
      </div>

      <div className="appointments-list">
        {sampleAppointments.length > 0 ? (
          sampleAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="doctor-info-header">
                  <img src={appointment.doctor_image} alt={appointment.doctor_name} className="doctor-avatar" />
                  <div className="doctor-info-text">
                    <h3>{appointment.doctor_name}</h3>
                    <p className="specialty">{appointment.specialty}</p>
                  </div>
                </div>
                <span className={`status ${appointment.status}`}>
                  {appointment.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                </span>
              </div>

              <div className="appointment-details">
                <div className="detail-group">
                  <div className="detail-item">
                    <Calendar size={18} />
                    <div>
                      <span className="label">Date</span>
                      <span className="value">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <div>
                      <span className="label">Time</span>
                      <span className="value">{appointment.time}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-group">
                  <div className="detail-item">
                    <MapPin size={18} />
                    <div>
                      <span className="label">Location</span>
                      <span className="value">{appointment.hospital_name}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Phone size={18} />
                    <div>
                      <span className="label">Hospital Phone</span>
                      <span className="value">+880-2-9881188</span>
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
                {appointment.status === 'scheduled' && (
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
          ))
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
