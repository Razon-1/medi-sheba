import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import '../styles/AdminDashboard.css';
import * as hospitalApi from '../api/hospitals';
import * as doctorApi from '../api/doctors';
import * as edoctorApi from '../api/edoctor';
import { appointmentsAPI } from '../api/appointments';

const HospitalAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('doctors');
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [edoctors, setEdoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingHospital, setEditingHospital] = useState(false);
  const [reviewPeriod, setReviewPeriod] = useState('weekly');
  const [revenueSummary, setRevenueSummary] = useState({
    appointmentsRevenue: 0,
    consultationsRevenue: 0,
    totalRevenue: 0,
    appointmentsCount: 0,
    consultationsCount: 0,
    breakdown: []
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (user && !user.roles.includes('hospital_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.roles.includes('hospital_admin')) {
      loadHospitalData();
    }
  }, [activeTab, user]);

  const loadHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load hospital info
      const hospitalRes = await hospitalApi.getMyHospital();
      // Handle both direct object and wrapped response
      const hospitalData = hospitalRes.data || hospitalRes;
      setHospital(hospitalData);

      // Load data based on active tab
      if (activeTab === 'doctors') {
        const doctorsRes = await doctorApi.getMyDoctors();
        // API returns array directly, not wrapped in {data: ...}
        const doctorsData = Array.isArray(doctorsRes.data) ? doctorsRes.data : (Array.isArray(doctorsRes) ? doctorsRes : []);
        setDoctors(doctorsData);
      } else if (activeTab === 'edoctors') {
        const edoctorsRes = await edoctorApi.getMyEdoctors();
        const edoctorsData = Array.isArray(edoctorsRes.data) ? edoctorsRes.data : (Array.isArray(edoctorsRes) ? edoctorsRes : []);
        setEdoctors(edoctorsData);
      } else if (activeTab === 'appointments') {
        const appointmentsRes = await appointmentsAPI.hospitalAppointments();
        const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
        setAppointments(appointmentsData);
      } else if (activeTab === 'consultations') {
        const consultationsRes = await edoctorApi.edoctorAPI.hospitalConsultations();
        const consultationsData = Array.isArray(consultationsRes.data) ? consultationsRes.data : (Array.isArray(consultationsRes) ? consultationsRes : []);
        setConsultations(consultationsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      const status = err.response?.status || err.status;

      // If no hospital exists for this admin, redirect to hospital creation
      if (status === 404 || (err.message && err.message.includes('404'))) {
        console.log('No hospital assigned to admin. Redirecting to hospital creation page...');
        navigate('/hospital-create');
        return;
      }

      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodStart = (period) => {
    const now = new Date();
    if (period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return start;
    }
    if (period === 'monthly') {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      return start;
    }
    if (period === 'yearly') {
      const start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      return start;
    }
    return new Date(0);
  };

  const parseDateValue = (value) => {
    const date = value ? new Date(value) : null;
    return date instanceof Date && !isNaN(date) ? date : null;
  };

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const loadHospitalRevenueSummary = async () => {
    try {
      setReviewLoading(true);
      setError(null);
      const [appointmentsRes, consultationsRes] = await Promise.all([
        appointmentsAPI.hospitalAppointments(),
        edoctorApi.edoctorAPI.hospitalConsultations()
      ]);
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      const consultationsData = Array.isArray(consultationsRes.data) ? consultationsRes.data : (Array.isArray(consultationsRes) ? consultationsRes : []);
      const periodStart = getPeriodStart(reviewPeriod);

      const filteredAppointments = appointmentsData.filter((appointment) => {
        const created = parseDateValue(appointment.created_at || appointment.appointment_date);
        return created && created >= periodStart && appointment.payment_status === 'paid';
      });

      const filteredConsultations = consultationsData.filter((consultation) => {
        const created = parseDateValue(consultation.created_at || consultation.scheduled_date);
        return created && created >= periodStart && (consultation.is_paid === true || consultation.payment_status === 'paid');
      });

      const appointmentsRevenue = filteredAppointments.reduce((sum, appointment) => sum + parseFloat(appointment.fee_amount || 0), 0);
      const consultationsRevenue = filteredConsultations.reduce((sum, consultation) => sum + parseFloat(consultation.fee_amount || 0), 0);

      setRevenueSummary({
        appointmentsRevenue,
        consultationsRevenue,
        totalRevenue: appointmentsRevenue + consultationsRevenue,
        appointmentsCount: filteredAppointments.length,
        consultationsCount: filteredConsultations.length,
        breakdown: [
          { label: 'Appointments', value: appointmentsRevenue, color: '#1D72B8' },
          { label: 'Consultations', value: consultationsRevenue, color: '#28A745' }
        ]
      });
    } catch (err) {
      console.error('Error loading hospital revenue summary:', err);
      setError(err.message || 'Failed to load revenue review');
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.roles.includes('hospital_admin') && activeTab === 'review') {
      loadHospitalRevenueSummary();
    }
  }, [activeTab, reviewPeriod, user]);

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const renderPieChart = (breakdown) => {
    const total = breakdown.reduce((sum, item) => sum + item.value, 0);
    const center = 110;
    const radius = 82;
    let currentAngle = -90;

    const getCoordinates = (angle) => {
      const angleInRadians = (Math.PI / 180) * angle;
      return {
        x: center + radius * Math.cos(angleInRadians),
        y: center + radius * Math.sin(angleInRadians)
      };
    };

    return (
      <svg className="revenue-pie-chart" width="220" height="220" viewBox="0 0 220 220" role="img" aria-label="Revenue pie chart">
        {!total && (
          <circle cx={center} cy={center} r={radius} fill="#d0d7e6">
            <title>No revenue found for this period</title>
          </circle>
        )}
        {breakdown.map((item) => {
          if (!total || item.value <= 0) return null;

          const sliceAngle = (item.value / total) * 360;
          const start = getCoordinates(currentAngle);
          const end = getCoordinates(currentAngle + sliceAngle);
          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const pathData = sliceAngle >= 360
            ? [
                `M ${center} ${center}`,
                `L ${center} ${center - radius}`,
                `A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius}`,
                'Z'
              ].join(' ')
            : [
                `M ${center} ${center}`,
                `L ${start.x} ${start.y}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
                'Z'
              ].join(' ');

          currentAngle += sliceAngle;

          return (
            <path
              key={item.label}
              d={pathData}
              fill={item.color}
            >
              <title>{`${item.label}: ${formatCurrency(item.value)} (${Math.round((item.value / total) * 100)}%)`}</title>
            </path>
          );
        })}
      </svg>
    );
  };

  const getRevenuePercentage = (value, total) => {
    if (!total || value <= 0) return 0;
    return Math.round((value / total) * 100);
  };

  const ReviewTab = () => (
    <div className="review-tab">
      <div className="review-header">
        <div>
          <h2>📈 Revenue Review</h2>
          <p>View earnings from hospital services for the selected period.</p>
        </div>
        <div className="review-periods">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              type="button"
              className={`period-button ${reviewPeriod === period ? 'active' : ''}`}
              onClick={() => setReviewPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {reviewLoading ? (
        <div className="review-loading">Loading revenue review...</div>
      ) : (
        (() => {
          const chartTotal = revenueSummary.breakdown.reduce((sum, item) => sum + item.value, 0);

          return (
            <div className="review-grid">
              <div className="review-summary">
                <div className="revenue-card">
                  <p>Total Revenue</p>
                  <strong>{formatCurrency(revenueSummary.totalRevenue)}</strong>
                </div>
                <div className="revenue-card">
                  <p>Appointment Earnings</p>
                  <strong>{formatCurrency(revenueSummary.appointmentsRevenue)}</strong>
                  <small>{revenueSummary.appointmentsCount} paid appointments</small>
                </div>
                <div className="revenue-card">
                  <p>Consultation Earnings</p>
                  <strong>{formatCurrency(revenueSummary.consultationsRevenue)}</strong>
                  <small>{revenueSummary.consultationsCount} paid consultations</small>
                </div>
              </div>

              <div className="review-chart-card">
                <div className="review-chart-title">Revenue by Service</div>
                {renderPieChart(revenueSummary.breakdown)}
                <div className="pie-legend">
                  {revenueSummary.breakdown.map((item) => (
                    <div key={item.label} className="pie-legend-item">
                      <div className="pie-legend-main">
                        <span className="pie-dot" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </div>
                      <strong className="pie-legend-value">
                        {formatCurrency(item.value)} · {getRevenuePercentage(item.value, chartTotal)}%
                      </strong>
                    </div>
                  ))}
                </div>
                {revenueSummary.totalRevenue === 0 && (
                  <div className="empty-pie">Add paid earnings to see the pie split dynamically.</div>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );

  const handleConfirmAppointment = async (appointment) => {
    try {
      const appointmentDate = window.prompt('Enter appointment date (YYYY-MM-DD):', appointment.appointment_date || '');
      if (!appointmentDate) return;
      
      const appointmentTime = window.prompt('Enter appointment time (HH:MM):', appointment.appointment_time || '');
      if (!appointmentTime) return;
      
      await appointmentsAPI.confirm(appointment.id, appointmentDate, appointmentTime);
      // Reload appointments
      const appointmentsRes = await appointmentsAPI.hospitalAppointments();
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      setAppointments(appointmentsData);
      alert('Appointment confirmed successfully!');
    } catch (err) {
      alert('Failed to confirm appointment: ' + err.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const reason = window.prompt('Enter cancellation reason:');
      await appointmentsAPI.cancel(appointmentId);
      // Reload appointments
      const appointmentsRes = await appointmentsAPI.hospitalAppointments();
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      setAppointments(appointmentsData);
      alert('Appointment cancelled successfully!');
    } catch (err) {
      alert('Failed to cancel appointment: ' + err.message);
    }
  };

  const handleConfirmConsultation = async (consultation) => {
    try {
      await edoctorApi.edoctorAPI.confirmConsultation(consultation.id);
      // Reload consultations
      const consultationsRes = await edoctorApi.edoctorAPI.hospitalConsultations();
      const consultationsData = Array.isArray(consultationsRes.data) ? consultationsRes.data : (Array.isArray(consultationsRes) ? consultationsRes : []);
      setConsultations(consultationsData);
      alert('Consultation confirmed successfully!');
    } catch (err) {
      alert('Failed to confirm consultation: ' + err.message);
    }
  };

  const handleCancelConsultation = async (consultationId) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) return;
    
    try {
      await edoctorApi.edoctorAPI.cancelConsultation(consultationId);
      // Reload consultations
      const consultationsRes = await edoctorApi.edoctorAPI.hospitalConsultations();
      const consultationsData = Array.isArray(consultationsRes.data) ? consultationsRes.data : (Array.isArray(consultationsRes) ? consultationsRes : []);
      setConsultations(consultationsData);
      alert('Consultation cancelled successfully!');
    } catch (err) {
      alert('Failed to cancel consultation: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'doctors') {
        await doctorApi.deleteDoctor(id);
        setDoctors(doctors.filter(d => d.id !== id));
      } else if (activeTab === 'edoctors') {
        await edoctorApi.deleteEdoctor(id);
        setEdoctors(edoctors.filter(e => e.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        // Handle hospital info update
        let submitData = { ...formData };
        
        // Upload image files if provided and convert to URLs
        if (formData.hospital_image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.hospital_image_file);
            submitData.image_url = res.data.image_url;
          } catch (err) {
            console.error('Hospital image upload failed:', err);
          }
        } else if (formData.hospital_image_url) {
          submitData.image_url = formData.hospital_image_url;
        }
        
        if (formData.doctor_image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.doctor_image_file);
            submitData.doctor_image_url = res.data.image_url;
          } catch (err) {
            console.error('Doctor image upload failed:', err);
          }
        } else if (formData.doctor_image_url) {
          submitData.doctor_image_url = formData.doctor_image_url;
        }
        
        if (formData.edoctor_image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.edoctor_image_file);
            submitData.edoctor_image_url = res.data.image_url;
          } catch (err) {
            console.error('E-Doctor image upload failed:', err);
          }
        } else if (formData.edoctor_image_url) {
          submitData.edoctor_image_url = formData.edoctor_image_url;
        }
        
        // Remove the temporary image file fields
        delete submitData.hospital_image_file;
        delete submitData.doctor_image_file;
        delete submitData.edoctor_image_file;
        delete submitData.hospital_image_url;
        
        const res = await hospitalApi.updateHospital(hospital.id, submitData);
        setHospital(res.data);
        setEditingHospital(false);
        setFormData({});
        setError(null);
      } else if (activeTab === 'doctors') {
        let submitData = {...formData, hospital: hospital.id};
        
        // Upload doctor image if file provided
        if (formData.image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.image_file);
            submitData.image_url = res.data.image_url;
          } catch (err) {
            console.error('Image upload failed:', err);
            // Fall back to hospital default or provided URL
            if ((!submitData.image_url || submitData.image_url.trim() === '') && hospital.doctor_image_url) {
              submitData.image_url = hospital.doctor_image_url;
            }
          }
        } else if ((!submitData.image_url || submitData.image_url.trim() === '') && hospital.doctor_image_url) {
          // Use hospital's default doctor image if no specific image provided
          submitData.image_url = hospital.doctor_image_url;
        }
        
        delete submitData.image_file;
        
        if (editingItem) {
          const res = await doctorApi.updateDoctor(editingItem.id, submitData);
          const updated = res.data;
          setDoctors(doctors.map(d => d.id === updated.id ? updated : d));
        } else {
          const res = await doctorApi.addDoctor(submitData);
          const newDoctor = res.data;
          setDoctors([...doctors, newDoctor]);
        }
      } else if (activeTab === 'edoctors') {
        let submitData = {...formData};
        
        // Upload e-doctor image if file provided
        if (formData.image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.image_file);
            submitData.image_url = res.data.image_url;
          } catch (err) {
            console.error('Image upload failed:', err);
            // Fall back to hospital default or provided URL
            if ((!submitData.image_url || submitData.image_url.trim() === '') && hospital.edoctor_image_url) {
              submitData.image_url = hospital.edoctor_image_url;
            }
          }
        } else if ((!submitData.image_url || submitData.image_url.trim() === '') && hospital.edoctor_image_url) {
          // Use hospital's default e-doctor image if no specific image provided
          submitData.image_url = hospital.edoctor_image_url;
        }
        
        delete submitData.image_file;
        
        if (editingItem) {
          const res = await edoctorApi.updateEdoctor(editingItem.id, submitData);
          const updated = res.data;
          setEdoctors(edoctors.map(e => e.id === updated.id ? updated : e));
        } else {
          const res = await edoctorApi.addEdoctor({...submitData, hospital: hospital.id});
          const newEdoctor = res.data;
          setEdoctors([...edoctors, newEdoctor]);
        }
      }
      setShowForm(false);
      setFormData({});
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const DoctorsTab = () => (
    <div className="admin-content">
      <h2>🩺 Manage Doctors</h2>
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add Doctor</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Qualification</th>
            <th>Phone</th>
            <th>Public</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(doctor => (
            <tr key={doctor.id}>
              <td>{doctor.user?.first_name} {doctor.user?.last_name}</td>
              <td>{doctor.specialty}</td>
              <td>{doctor.qualifications}</td>
              <td>{doctor.user?.phone_number}</td>
              <td>{doctor.is_available ? '✓' : '✗'}</td>
              <td>{doctor.is_verified ? '✓ Verified' : '✗ Not Verified'}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(doctor)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const EdoctorsTab = () => (
    <div className="admin-content">
      <h2>💻 Manage E-Doctors</h2>
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add E-Doctor</button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Phone</th>
            <th>Consultation Fee</th>
            <th>Public</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {edoctors.map(edoctor => (
            <tr key={edoctor.id}>
              <td>{edoctor.name}</td>
              <td>{edoctor.specialization}</td>
              <td>{edoctor.phone_number}</td>
              <td>৳{parseFloat(edoctor.consultation_fee).toFixed(2)}</td>
              <td>{edoctor.is_available ? '✓' : '✗'}</td>
              <td>{edoctor.is_verified ? '✓ Verified' : '✗ Not Verified'}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEditClick(edoctor)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(edoctor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleEditHospital = () => {
    setFormData(hospital);
    setEditingHospital(true);
    setShowForm(true);
  };

  const HospitalInfoTab = () => (
    <div className="admin-content">
      <h2>🏥 Hospital Information</h2>
      {hospital && (
        <>
          <div className="info-card">
            <p><strong>Hospital Name:</strong> {hospital.name}</p>
            <p><strong>Phone:</strong> {hospital.phone_primary || hospital.phone_number}</p>
            <p><strong>Email:</strong> {hospital.email}</p>
            <p><strong>Address:</strong> {hospital.address}</p>
            <p><strong>District:</strong> {hospital.district}</p>
            <p><strong>Type:</strong> {hospital.type}</p>
            <p><strong>Beds:</strong> Total: {hospital.beds_total} | Available: {hospital.beds_available}</p>
            <p><strong>Status:</strong> {hospital.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Emergency Available:</strong> {hospital.emergency_available ? 'Yes' : 'No'}</p>
          </div>
          <button className="btn btn-primary" onClick={handleEditHospital} style={{marginTop: '20px'}}>
            ✏️ Edit Hospital Information
          </button>
        </>
      )}
    </div>
  );

  const AppointmentsTab = () => (
    <div className="admin-content">
      <h2>📅 Patient Appointments</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Appointment No</th>
            <th>Patient Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>No appointments found</td></tr>
          ) : (
            appointments.map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.appointment_no}</td>
                <td>{appointment.patient?.first_name} {appointment.patient?.last_name}</td>
                <td>Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}</td>
                <td>{appointment.appointment_date || '-'}</td>
                <td>{appointment.appointment_time || '-'}</td>
                <td>{appointment.type}</td>
                <td><span style={{backgroundColor: appointment.status === 'confirmed' ? '#d4edda' : '#fff3cd', padding: '4px 8px', borderRadius: '4px'}}>{appointment.status}</span></td>
                <td>{appointment.payment_status}</td>
                <td>
                  {appointment.status === 'pending' && (
                    <button className="btn-edit" onClick={() => handleConfirmAppointment(appointment)}>Confirm</button>
                  )}
                  <button className="btn-delete" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const ConsultationsTab = () => (
    <div className="admin-content">
      <h2>💻 E-Doctor Consultations</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Consultation ID</th>
            <th>Patient Name</th>
            <th>E-Doctor</th>
            <th>Date</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Fee</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultations.length === 0 ? (
            <tr><td colSpan="9" style={{textAlign: 'center', padding: '20px'}}>No consultations found</td></tr>
          ) : (
            consultations.map(consultation => (
              <tr key={consultation.id}>
                <td>{consultation.consultation_id}</td>
                <td>{consultation.patient_name}</td>
                <td>Dr. {consultation.doctor?.name}</td>
                <td>{consultation.scheduled_date || '-'}</td>
                <td>{consultation.urgency}</td>
                <td><span style={{backgroundColor: consultation.status === 'confirmed' ? '#d4edda' : '#fff3cd', padding: '4px 8px', borderRadius: '4px'}}>{consultation.status}</span></td>
                <td>৳{consultation.fee_amount}</td>
                <td>{consultation.is_paid ? '✓ Paid' : '✗ Unpaid'}</td>
                <td>
                  {consultation.status === 'scheduled' && (
                    <button className="btn-edit" onClick={() => handleConfirmConsultation(consultation)}>Confirm</button>
                  )}
                  <button className="btn-delete" onClick={() => handleCancelConsultation(consultation.id)}>Cancel</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading && !hospital) {
    return <div className="loading">Loading Hospital Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🏥 Hospital Admin Dashboard</h1>
        {hospital && <p className="hospital-name">{hospital.name}</p>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          🩺 Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'edoctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('edoctors')}
        >
          💻 E-Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button
          className={`tab-button ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultations')}
        >
          💬 Consultations
        </button>
        <button
          className={`tab-button ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          📈 Revenue Review
        </button>
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          ℹ️ Hospital Info
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'doctors' && <DoctorsTab />}
        {activeTab === 'edoctors' && <EdoctorsTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'consultations' && <ConsultationsTab />}
        {activeTab === 'review' && <ReviewTab />}
        {activeTab === 'info' && <HospitalInfoTab />}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingHospital(false);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingHospital ? 'Edit Hospital Information' : (editingItem ? 'Edit Item' : 'Add New Item')}
            </h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {activeTab === 'doctors' && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="BMDC Number"
                    value={formData.bmdc_number || ''}
                    onChange={(e) => setFormData({...formData, bmdc_number: e.target.value})}
                    required
                  />
                  <select
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="ENT">ENT</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Qualifications (e.g., MBBS, MD)"
                    value={formData.qualifications || ''}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={formData.experience_years || ''}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (BDT)"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Follow-up Fee (BDT)"
                    step="0.01"
                    value={formData.follow_up_fee || ''}
                    onChange={(e) => setFormData({...formData, follow_up_fee: e.target.value})}
                  />
                  <textarea
                    placeholder="Chamber Address"
                    value={formData.chamber_address || ''}
                    onChange={(e) => setFormData({...formData, chamber_address: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Available Days (e.g., Mon,Tue,Wed)"
                    value={formData.available_days || ''}
                    onChange={(e) => setFormData({...formData, available_days: e.target.value})}
                  />
                  <input
                    type="time"
                    placeholder="Available Time Start"
                    value={formData.available_time_start || ''}
                    onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                  />
                  <input
                    type="time"
                    placeholder="Available Time End"
                    value={formData.available_time_end || ''}
                    onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                  />
                  <textarea
                    placeholder="Bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_available !== false}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    Make available for public (visible without login)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_verified === true}
                      onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                    />
                    Verify this doctor (show verification badge)
                  </label>
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: 0 }}>📸 Doctor Image (Optional)</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
                      style={{ padding: '8px', marginBottom: '10px' }}
                    />
                    <small style={{ display: 'block', color: '#666', marginBottom: '5px' }}>Or enter image URL:</small>
                    <input
                      type="url"
                      placeholder="Doctor image URL"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}
              {activeTab === 'edoctors' && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    required
                  >
                    <option>Select Specialization</option>
                    <option value="general">General Practitioner</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                  </select>
                  <select
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    required
                  >
                    <option>Select Qualification</option>
                    <option value="mbbs">MBBS</option>
                    <option value="md">MD</option>
                    <option value="ms">MS</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={formData.experience_years || ''}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    required
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="Registration Number"
                    value={formData.registration_number || ''}
                    onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee"
                    step="0.01"
                    value={formData.consultation_fee || ''}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Available Days (e.g., Monday, Tuesday, Wednesday)"
                    value={formData.available_days || ''}
                    onChange={(e) => setFormData({...formData, available_days: e.target.value})}
                  />
                  <label>Consultation Hours</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="time"
                      placeholder="Start Time"
                      value={formData.available_start_time || ''}
                      onChange={(e) => setFormData({...formData, available_start_time: e.target.value})}
                    />
                    <input
                      type="time"
                      placeholder="End Time"
                      value={formData.available_end_time || ''}
                      onChange={(e) => setFormData({...formData, available_end_time: e.target.value})}
                    />
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_available !== false}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    Make available for public (visible without login)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_verified === true}
                      onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                    />
                    Verify this E-Doctor (show verification badge)
                  </label>
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: 0 }}>📸 E-Doctor Image (Optional)</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
                      style={{ padding: '8px', marginBottom: '10px' }}
                    />
                    <small style={{ display: 'block', color: '#666', marginBottom: '5px' }}>Or enter image URL:</small>
                    <input
                      type="url"
                      placeholder="E-Doctor image URL"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}
              {editingHospital && (
                <>
                  <input
                    type="text"
                    placeholder="Hospital Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Hospital Type</option>
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="clinic">Clinic</option>
                  </select>
                  <textarea
                    placeholder="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="District"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Upazila"
                    value={formData.upazila || ''}
                    onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Primary Phone"
                    value={formData.phone_primary || ''}
                    onChange={(e) => setFormData({...formData, phone_primary: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Secondary Phone"
                    value={formData.phone_secondary || ''}
                    onChange={(e) => setFormData({...formData, phone_secondary: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="url"
                    placeholder="Website"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Total Beds"
                    value={formData.beds_total || ''}
                    onChange={(e) => setFormData({...formData, beds_total: parseInt(e.target.value)})}
                  />
                  <input
                    type="number"
                    placeholder="Available Beds"
                    value={formData.beds_available || ''}
                    onChange={(e) => setFormData({...formData, beds_available: parseInt(e.target.value)})}
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  <textarea
                    placeholder="Services (comma-separated)"
                    value={formData.services || ''}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                  />
                  <textarea
                    placeholder="Special Facilities (comma-separated)"
                    value={formData.special_facilities || ''}
                    onChange={(e) => setFormData({...formData, special_facilities: e.target.value})}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.emergency_available || false}
                      onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                    />
                    Emergency Available (24/7)
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Active Status
                  </label>
                  {editingHospital && (
                    <>
                      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0 }}>📸 Upload Images (Optional)</h4>
                        
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hospital Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, hospital_image_file: e.target.files[0]})}
                            style={{ padding: '8px' }}
                          />
                          <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>Or enter image URL:</small>
                          <input
                            type="url"
                            placeholder="Hospital image URL"
                            value={formData.hospital_image_url || ''}
                            onChange={(e) => setFormData({...formData, hospital_image_url: e.target.value})}
                            style={{ marginTop: '5px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Doctor Image (for doctors added)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, doctor_image_file: e.target.files[0]})}
                            style={{ padding: '8px' }}
                          />
                          <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>Or enter image URL:</small>
                          <input
                            type="url"
                            placeholder="Doctor image URL"
                            value={formData.doctor_image_url || ''}
                            onChange={(e) => setFormData({...formData, doctor_image_url: e.target.value})}
                            style={{ marginTop: '5px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>E-Doctor Image (for e-doctors added)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, edoctor_image_file: e.target.files[0]})}
                            style={{ padding: '8px' }}
                          />
                          <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>Or enter image URL:</small>
                          <input
                            type="url"
                            placeholder="E-Doctor image URL"
                            value={formData.edoctor_image_url || ''}
                            onChange={(e) => setFormData({...formData, edoctor_image_url: e.target.value})}
                            style={{ marginTop: '5px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowForm(false);
                  setEditingHospital(false);
                  setFormData({});
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboard;
