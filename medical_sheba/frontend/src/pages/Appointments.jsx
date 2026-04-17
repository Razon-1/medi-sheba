import { useState, useEffect } from 'react';
import useAuthStore from '../context/authStore';
import { appointmentsAPI } from '../api/appointments';
import Loading from '../components/Loading';
import Error from '../components/Error';
import '../styles/pages/Appointments.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await appointmentsAPI.list();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentsAPI.cancel(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  if (!user) {
    return (
      <div className="appointments-page">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in to view your appointments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Manage your medical appointments</p>
      </div>

      {loading && <Loading />}
      {error && <Error message={error} onRetry={fetchAppointments} />}

      {!loading && !error && (
        <div className="appointments-list">
          {appointments.length > 0 ? (
            appointments.map(appointment => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{appointment.doctor_name}</h3>
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  <p><strong>Location:</strong> {appointment.hospital_name}</p>
                </div>
                <div className="appointment-actions">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button className="btn-reschedule">Reschedule</button>
                      <button className="btn-cancel" onClick={() => handleCancel(appointment.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No appointments found. Book one now!</p>
          )}
        </div>
      )}
    </div>
  );
}
