// Search keyword: Page Hospital Admin Dashboard - doctors, appointments, consultations, revenue review, and hospital info tabs.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import '../styles/AdminDashboard.css';
import * as hospitalApi from '../api/hospitals';
import * as doctorApi from '../api/doctors';
import * as edoctorApi from '../api/edoctor';
import { appointmentsAPI } from '../api/appointments';
import { validateBangladeshPhone, validateEmail, validateNumberRange, validateRequired } from '../utils/validators';
import { AdminSubscriptionPrompt, useAdminSubscriptionAccess } from '../components/AdminSubscriptionAccess';

const weekdayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const createEmptyAvailabilityRow = () => ({
  day: '',
  slots: [{ start_time: '10:00', end_time: '10:15' }],
});

const HospitalAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    checkingAccess,
    accessState,
    accessError,
    trialLoading,
    startTrial,
  } = useAdminSubscriptionAccess('hospital_admin');
  // Controls which hospital admin dashboard tab is currently open.
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
  const [formErrors, setFormErrors] = useState({});
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
    if (accessState === 'active' && user && user.roles.includes('hospital_admin')) {
      loadHospitalData();
    }
  }, [activeTab, accessState, user]);

  const loadHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load hospital info
      const hospitalRes = await hospitalApi.getMyHospital();
      // Handle both direct object and wrapped response
      const hospitalData = hospitalRes.data || hospitalRes;
      setHospital(hospitalData);

      // Load data based on active tab.
      if (activeTab === 'doctors') {
        // Doctors tab: load the hospital's in-person doctors.
        const doctorsRes = await doctorApi.getMyDoctors();
        // API returns array directly, not wrapped in {data: ...}
        const doctorsData = Array.isArray(doctorsRes.data) ? doctorsRes.data : (Array.isArray(doctorsRes) ? doctorsRes : []);
        setDoctors(doctorsData);
      } else if (activeTab === 'edoctors') {
        // E-Doctors tab: load the hospital's online consultation doctors.
        const edoctorsRes = await edoctorApi.getMyEdoctors();
        const edoctorsData = Array.isArray(edoctorsRes.data) ? edoctorsRes.data : (Array.isArray(edoctorsRes) ? edoctorsRes : []);
        setEdoctors(edoctorsData);
      } else if (activeTab === 'appointments') {
        // Appointments tab: load patient appointments for this hospital.
        const appointmentsRes = await appointmentsAPI.hospitalAppointments();
        const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
        setAppointments(appointmentsData);
      } else if (activeTab === 'consultations') {
        // Consultations tab: load e-doctor consultation requests.
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

      // Revenue calculation for Revenue Review tab: add paid appointment fees in the selected period.
      const appointmentsRevenue = filteredAppointments.reduce((sum, appointment) => sum + parseFloat(appointment.fee_amount || 0), 0);
      // Revenue calculation for Revenue Review tab: add paid e-doctor consultation fees in the selected period.
      const consultationsRevenue = filteredConsultations.reduce((sum, consultation) => sum + parseFloat(consultation.fee_amount || 0), 0);

      setRevenueSummary({
        appointmentsRevenue,
        consultationsRevenue,
        // Total revenue calculation: appointment revenue plus consultation revenue.
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
    setFormErrors({});
    setError(null);
    setShowForm(true);
  };

  const formatTimeForInput = (value) => {
    if (!value) return '';
    return String(value).slice(0, 5);
  };

  const formatAvailabilityTime = (start, end) => {
    if (!start || !end) return '-';
    return `${formatTimeForInput(start)} - ${formatTimeForInput(end)}`;
  };

  const normalizeAvailabilitySchedule = (doctor = {}) => {
    if (Array.isArray(doctor.availability_schedule) && doctor.availability_schedule.length > 0) {
      return doctor.availability_schedule.map((item) => ({
        day: item.day || '',
        slots: Array.isArray(item.slots) && item.slots.length > 0
          ? item.slots.map((slot) => ({
              start_time: formatTimeForInput(slot.start_time),
              end_time: formatTimeForInput(slot.end_time),
            }))
          : [{
              start_time: formatTimeForInput(item.start_time) || '10:00',
              end_time: formatTimeForInput(item.end_time) || '10:15',
            }],
      }));
    }

    const days = String(doctor.available_days || '')
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean);

    if (days.length === 0) return [createEmptyAvailabilityRow()];

    return days.map((day) => ({
      day,
      slots: [{
        start_time: formatTimeForInput(doctor.available_start_time) || '10:00',
        end_time: formatTimeForInput(doctor.available_end_time) || '10:15',
      }],
    }));
  };

  const normalizeDoctorFormData = (doctor) => {
    const userData = doctor.user || {};

    return {
      ...doctor,
      first_name: doctor.first_name || userData.first_name || '',
      last_name: doctor.last_name || userData.last_name || '',
      email: doctor.email || userData.email || '',
      phone_number: doctor.phone_number || userData.phone_number || userData.phone || doctor.phone || '',
      available_time_start: formatTimeForInput(doctor.available_time_start),
      available_time_end: formatTimeForInput(doctor.available_time_end),
    };
  };

  const normalizeEDoctorFormData = (doctor) => ({
    ...doctor,
    availability_schedule: normalizeAvailabilitySchedule(doctor),
    available_start_time: formatTimeForInput(doctor.available_start_time),
    available_end_time: formatTimeForInput(doctor.available_end_time),
  });

  const normalizeHospitalFormData = (hospitalData) => ({
    ...hospitalData,
    hospital_image_url: hospitalData.hospital_image_url || hospitalData.image_url || '',
  });

  const pickEditableFields = (data, fields) => fields.reduce((picked, field) => {
    if (data[field] !== undefined) {
      picked[field] = data[field];
    }
    return picked;
  }, {});

  const doctorEditableFields = [
    'hospital', 'first_name', 'last_name', 'email', 'phone_number', 'bmdc_number',
    'specialty', 'subspecialty', 'qualifications', 'experience_years',
    'consultation_fee', 'follow_up_fee', 'chamber_address', 'available_days',
    'available_time_start', 'available_time_end', 'bio', 'languages',
    'is_available', 'requires_authentication', 'image_url'
  ];

  const edoctorEditableFields = [
    'hospital', 'name', 'specialization', 'qualification', 'experience_years',
    'registration_number', 'email', 'phone_number', 'hospital_name',
    'consultation_address', 'consultation_fee', 'consultation_duration_minutes',
    'languages_spoken', 'available_days', 'available_start_time',
    'available_end_time', 'availability_schedule', 'is_available', 'requires_authentication', 'bio',
    'specialties', 'image_url'
  ];

  const keepExistingImageOnEdit = (submitData, currentItem, fallbackImageUrl) => {
    if (submitData.image_url && String(submitData.image_url).trim() !== '') {
      return;
    }

    if (currentItem?.image_url) {
      submitData.image_url = currentItem.image_url;
      return;
    }

    if (!currentItem && fallbackImageUrl) {
      submitData.image_url = fallbackImageUrl;
    }
  };

  const handleEditClick = async (item) => {
    setEditingItem(item);
    setFormErrors({});
    setError(null);

    if (activeTab === 'doctors') {
      setFormData(normalizeDoctorFormData(item));
    } else if (activeTab === 'edoctors') {
      setFormData(normalizeEDoctorFormData(item));

      try {
        const response = await edoctorApi.edoctorAPI.getDoctor(item.id);
        const detailData = response.data || response;
        setFormData(normalizeEDoctorFormData(detailData));
      } catch (err) {
        console.error('Failed to load full e-doctor details:', err);
      }
    } else {
      setFormData(item);
    }

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

  // Revenue Review tab: shows hospital earnings from appointments and e-doctor consultations.
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
      await appointmentsAPI.confirm(appointment.id);
      // Reload appointments
      const appointmentsRes = await appointmentsAPI.hospitalAppointments();
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      setAppointments(appointmentsData);
      alert('Appointment confirmed successfully!');
    } catch (err) {
      alert('Failed to confirm appointment: ' + err.message);
    }
  };

  const handleCompleteAppointment = async (appointment) => {
    if (!window.confirm('Mark this appointment as completed?')) return;

    try {
      await appointmentsAPI.complete(appointment.id);
      const appointmentsRes = await appointmentsAPI.hospitalAppointments();
      const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      setAppointments(appointmentsData);
      alert('Appointment marked as completed!');
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || err.message;
      alert('Failed to complete appointment: ' + message);
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

  const handleCompleteConsultation = async (consultation) => {
    if (!window.confirm('Mark this consultation as completed?')) return;

    try {
      await edoctorApi.edoctorAPI.completeConsultation(consultation.id);
      const consultationsRes = await edoctorApi.edoctorAPI.hospitalConsultations();
      const consultationsData = Array.isArray(consultationsRes.data) ? consultationsRes.data : (Array.isArray(consultationsRes) ? consultationsRes : []);
      setConsultations(consultationsData);
      alert('Consultation marked as completed!');
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || err.message;
      alert('Failed to complete consultation: ' + message);
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

  const setFieldValue = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setError(null);
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const getFieldClassName = (field) => formErrors[field] ? 'input-error' : '';

  const renderFieldError = (field) => (
    formErrors[field] ? <span className="field-error">{formErrors[field]}</span> : null
  );

  const getAvailabilitySchedule = () => (
    Array.isArray(formData.availability_schedule) && formData.availability_schedule.length > 0
      ? formData.availability_schedule
      : [createEmptyAvailabilityRow()]
  );

  const syncAvailabilitySchedule = (schedule) => {
    const cleanedSchedule = schedule.map((item) => ({
      day: item.day || '',
      slots: Array.isArray(item.slots) && item.slots.length > 0
        ? item.slots.map((slot) => ({
            start_time: slot.start_time || '',
            end_time: slot.end_time || '',
          }))
        : [{ start_time: '', end_time: '' }],
    }));
    const validSchedule = cleanedSchedule
      .map((item) => ({
        ...item,
        slots: item.slots.filter((slot) => slot.start_time && slot.end_time),
      }))
      .filter((item) => item.day && item.slots.length > 0);
    const firstValid = validSchedule[0] || cleanedSchedule[0] || createEmptyAvailabilityRow();
    const firstSlot = firstValid.slots?.[0] || {};

    setFormData((current) => ({
      ...current,
      availability_schedule: cleanedSchedule,
      available_days: validSchedule.map((item) => item.day).join(', '),
      available_start_time: firstSlot.start_time || '',
      available_end_time: firstSlot.end_time || '',
    }));
    setFormErrors((current) => {
      const next = { ...current };
      delete next.availability_schedule;
      delete next.available_days;
      delete next.available_start_time;
      delete next.available_end_time;
      return next;
    });
  };

  const updateAvailabilityRow = (index, field, value) => {
    const nextSchedule = getAvailabilitySchedule().map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    syncAvailabilitySchedule(nextSchedule);
  };

  const updateAvailabilitySlot = (dayIndex, slotIndex, field, value) => {
    const nextSchedule = getAvailabilitySchedule().map((item, itemIndex) => {
      if (itemIndex !== dayIndex) return item;
      const slots = (item.slots || [{ start_time: '', end_time: '' }]).map((slot, currentSlotIndex) => (
        currentSlotIndex === slotIndex ? { ...slot, [field]: value } : slot
      ));
      return { ...item, slots };
    });
    syncAvailabilitySchedule(nextSchedule);
  };

  const addAvailabilitySlot = (dayIndex) => {
    const nextSchedule = getAvailabilitySchedule().map((item, itemIndex) => (
      itemIndex === dayIndex
        ? { ...item, slots: [...(item.slots || []), { start_time: '10:00', end_time: '10:15' }] }
        : item
    ));
    syncAvailabilitySchedule(nextSchedule);
  };

  const removeAvailabilitySlot = (dayIndex, slotIndex) => {
    const nextSchedule = getAvailabilitySchedule().map((item, itemIndex) => {
      if (itemIndex !== dayIndex) return item;
      const slots = (item.slots || []).filter((_, currentSlotIndex) => currentSlotIndex !== slotIndex);
      return { ...item, slots: slots.length > 0 ? slots : [{ start_time: '', end_time: '' }] };
    });
    syncAvailabilitySchedule(nextSchedule);
  };

  const addAvailabilityRow = () => {
    syncAvailabilitySchedule([...getAvailabilitySchedule(), createEmptyAvailabilityRow()]);
  };

  const removeAvailabilityRow = (index) => {
    const nextSchedule = getAvailabilitySchedule().filter((_, itemIndex) => itemIndex !== index);
    syncAvailabilitySchedule(nextSchedule.length > 0 ? nextSchedule : [createEmptyAvailabilityRow()]);
  };

  const validateDoctorForm = (data) => {
    const errors = {};

    if (!validateRequired(data.first_name)) errors.first_name = 'First name is required';
    if (!validateRequired(data.last_name)) errors.last_name = 'Last name is required';
    if (!validateRequired(data.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!validateRequired(data.phone_number)) {
      errors.phone_number = 'Phone number is required';
    } else if (!validateBangladeshPhone(data.phone_number)) {
      errors.phone_number = 'Enter a valid Bangladesh phone number, e.g. 01712345678 or +8801712345678';
    }
    if (!validateRequired(data.bmdc_number)) errors.bmdc_number = 'BMDC number is required';
    if (!validateRequired(data.specialty)) errors.specialty = 'Specialty is required';
    if (!validateRequired(data.qualifications)) errors.qualifications = 'Qualifications are required';
    if (!validateNumberRange(data.experience_years || 0, 0)) {
      errors.experience_years = 'Experience cannot be negative';
    }
    if (!validateRequired(data.consultation_fee)) {
      errors.consultation_fee = 'Consultation fee is required';
    } else if (!validateNumberRange(data.consultation_fee, 1)) {
      errors.consultation_fee = 'Consultation fee must be greater than 0';
    }
    if (data.follow_up_fee && !validateNumberRange(data.follow_up_fee, 0)) {
      errors.follow_up_fee = 'Follow-up fee cannot be negative';
    }

    return errors;
  };

  const validateEDoctorForm = (data) => {
    const errors = {};

    if (!validateRequired(data.name)) errors.name = 'Name is required';
    if (!validateRequired(data.specialization)) errors.specialization = 'Specialization is required';
    if (!validateRequired(data.qualification)) errors.qualification = 'Qualification is required';
    if (!validateNumberRange(data.experience_years, 0)) {
      errors.experience_years = 'Experience cannot be negative';
    }
    if (!validateRequired(data.registration_number)) errors.registration_number = 'Registration number is required';
    if (!validateRequired(data.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!validateRequired(data.phone_number)) {
      errors.phone_number = 'Phone number is required';
    } else if (!validateBangladeshPhone(data.phone_number)) {
      errors.phone_number = 'Enter a valid Bangladesh phone number, e.g. 01712345678 or +8801712345678';
    }
    const availabilitySchedule = Array.isArray(data.availability_schedule) ? data.availability_schedule : [];
    const validAvailabilityRows = availabilitySchedule.filter((item) => (
      item.day
      && Array.isArray(item.slots)
      && item.slots.some((slot) => slot.start_time && slot.end_time)
    ));
    if (validAvailabilityRows.length === 0) {
      errors.availability_schedule = 'Add at least one consultation day with one complete time slot';
    }
    if (!validateRequired(data.consultation_fee)) {
      errors.consultation_fee = 'Consultation fee is required';
    } else if (!validateNumberRange(data.consultation_fee, 1)) {
      errors.consultation_fee = 'Consultation fee must be greater than 0';
    }

    return errors;
  };

  const getApiFieldErrors = (err) => {
    const data = err?.response?.data || err?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

    return Object.entries(data).reduce((errors, [field, value]) => {
      if (['detail', 'error', 'message', 'non_field_errors'].includes(field)) return errors;
      if (Array.isArray(value)) {
        errors[field] = value.join(' ');
      } else if (typeof value === 'string') {
        errors[field] = value;
      }
      return errors;
    }, {});
  };

  const getSubmitErrorMessage = (err) => {
    const status = err?.response?.status || err?.status;
    const data = err?.response?.data || err?.data;

    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    if (status >= 500) {
      return 'Unable to save. Please check the highlighted fields and try again.';
    }
    return err.message || 'Unable to save. Please check the form and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
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
        const validationErrors = validateDoctorForm(formData);
        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          return;
        }
        setFormErrors({});

        let submitData = pickEditableFields(
          { ...formData, hospital: hospital.id },
          doctorEditableFields
        );
        
        // Upload doctor image if file provided
        if (formData.image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.image_file);
            submitData.image_url = res.data.image_url;
          } catch (err) {
            console.error('Image upload failed:', err);
            keepExistingImageOnEdit(submitData, editingItem, hospital.doctor_image_url);
          }
        } else {
          keepExistingImageOnEdit(submitData, editingItem, hospital.doctor_image_url);
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
        const validationErrors = validateEDoctorForm(formData);
        if (Object.keys(validationErrors).length > 0) {
          setFormErrors(validationErrors);
          return;
        }
        setFormErrors({});

        let submitData = pickEditableFields(
          { ...formData, hospital: hospital.id },
          edoctorEditableFields
        );
        
        // Upload e-doctor image if file provided
        if (formData.image_file) {
          try {
            const res = await hospitalApi.uploadImage(formData.image_file);
            submitData.image_url = res.data.image_url;
          } catch (err) {
            console.error('Image upload failed:', err);
            keepExistingImageOnEdit(submitData, editingItem, hospital.edoctor_image_url);
          }
        } else {
          keepExistingImageOnEdit(submitData, editingItem, hospital.edoctor_image_url);
        }
        
        delete submitData.image_file;
        
        if (editingItem) {
          const res = await edoctorApi.updateEdoctor(editingItem.id, submitData);
          const updated = res.data;
          setEdoctors(edoctors.map(e => e.id === updated.id ? updated : e));
        } else {
          const res = await edoctorApi.addEdoctor(submitData);
          const newEdoctor = res.data;
          setEdoctors([...edoctors, newEdoctor]);
        }
      }
      setShowForm(false);
      setFormData({});
      setFormErrors({});
      setEditingItem(null);
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFormErrors(apiFieldErrors);
        setError(null);
        return;
      }
      setError(getSubmitErrorMessage(err));
    }
  };

  // Doctors tab: add, edit, delete, and view in-person doctors.
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

  // E-Doctors tab: add, edit, delete, and view online consultation doctors.
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
            <th>Available Days</th>
            <th>Time</th>
            <th>Consultation Fee</th>
            <th>Public</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {edoctors.map(edoctor => (
            <tr key={edoctor.id}>
              <td>{edoctor.name}</td>
              <td>{edoctor.specialization}</td>
              <td>{edoctor.phone_number}</td>
              <td>{(Array.isArray(edoctor.availability_schedule) && edoctor.availability_schedule.length > 0) ? edoctor.availability_schedule.map((item) => item.day).join(', ') : (edoctor.available_days || '-')}</td>
              <td>{(Array.isArray(edoctor.availability_schedule) && edoctor.availability_schedule.length > 0) ? edoctor.availability_schedule.map((item) => `${item.day}: ${(item.slots || [{ start_time: item.start_time, end_time: item.end_time }]).map((slot) => formatAvailabilityTime(slot.start_time, slot.end_time)).join(', ')}`).join('; ') : formatAvailabilityTime(edoctor.available_start_time, edoctor.available_end_time)}</td>
              <td>৳{parseFloat(edoctor.consultation_fee).toFixed(2)}</td>
              <td>{edoctor.is_available ? '✓' : '✗'}</td>
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
    setFormData(normalizeHospitalFormData(hospital));
    setEditingHospital(true);
    setFormErrors({});
    setError(null);
    setShowForm(true);
  };

  // Hospital Info tab: view and edit this hospital's profile details.
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

  // Appointments tab: view and update patient appointment status.
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
                  {appointment.status === 'confirmed' && (
                    <button className="btn-edit" onClick={() => handleCompleteAppointment(appointment)}>Complete</button>
                  )}
                  {!['cancelled', 'completed'].includes(appointment.status) && (
                    <button className="btn-delete" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Consultations tab: view and update e-doctor consultation status.
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
                  {consultation.status === 'scheduled' && (
                    <button className="btn-delete" onClick={() => handleCancelConsultation(consultation.id)}>Cancel</button>
                  )}
                  {consultation.status === 'confirmed' && (
                    <button className="btn-edit" onClick={() => handleCompleteConsultation(consultation)}>Complete</button>
                  )}
                  {consultation.status === 'completed' && (
                    <span style={{ color: '#198754', fontWeight: 700 }}>Completed</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (checkingAccess || accessState !== 'active') {
    return (
      <AdminSubscriptionPrompt
        accessState={checkingAccess ? 'checking' : accessState}
        accessError={accessError}
        trialLoading={trialLoading}
        onStartTrial={startTrial}
        serviceName="hospital admin services"
        loadingTitle="Loading Hospital Access"
        loadingText="Checking your subscription and hospital access..."
      />
    );
  }

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

      {/* Tab buttons: clicking these changes activeTab and switches the dashboard section below. */}
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

      {/* Tab content: only the selected hospital admin tab is rendered here. */}
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
          setFormErrors({});
          setError(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingHospital ? 'Edit Hospital Information' : (editingItem ? 'Edit Item' : 'Add New Item')}
            </h3>
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              noValidate={!editingHospital && (activeTab === 'doctors' || activeTab === 'edoctors')}
            >
              {error && <div className="error-message">{error}</div>}
              {/* Doctors tab form fields: used when adding or editing an in-person doctor. */}
              {activeTab === 'doctors' && (
                <>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => setFieldValue('first_name', e.target.value)}
                      className={getFieldClassName('first_name')}
                      aria-invalid={Boolean(formErrors.first_name)}
                      required
                    />
                    {renderFieldError('first_name')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => setFieldValue('last_name', e.target.value)}
                      className={getFieldClassName('last_name')}
                      aria-invalid={Boolean(formErrors.last_name)}
                      required
                    />
                    {renderFieldError('last_name')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gmail Address *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFieldValue('email', e.target.value)}
                      className={getFieldClassName('email')}
                      aria-invalid={Boolean(formErrors.email)}
                      required
                    />
                    {renderFieldError('email')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={(e) => setFieldValue('phone_number', e.target.value)}
                      className={getFieldClassName('phone_number')}
                      aria-invalid={Boolean(formErrors.phone_number)}
                      required
                    />
                    {renderFieldError('phone_number')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">BMDC Number *</label>
                    <input
                      type="text"
                      value={formData.bmdc_number || ''}
                      onChange={(e) => setFieldValue('bmdc_number', e.target.value)}
                      className={getFieldClassName('bmdc_number')}
                      aria-invalid={Boolean(formErrors.bmdc_number)}
                      required
                    />
                    {renderFieldError('bmdc_number')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Specialty *</label>
                    <select
                      value={formData.specialty || ''}
                      onChange={(e) => setFieldValue('specialty', e.target.value)}
                      className={getFieldClassName('specialty')}
                      aria-invalid={Boolean(formErrors.specialty)}
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
                    {renderFieldError('specialty')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualifications (e.g., MBBS, MD) *</label>
                    <input
                      type="text"
                      value={formData.qualifications || ''}
                      onChange={(e) => setFieldValue('qualifications', e.target.value)}
                      className={getFieldClassName('qualifications')}
                      aria-invalid={Boolean(formErrors.qualifications)}
                      required
                    />
                    {renderFieldError('qualifications')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.experience_years || ''}
                      onChange={(e) => setFieldValue('experience_years', parseInt(e.target.value) || 0)}
                      className={getFieldClassName('experience_years')}
                      aria-invalid={Boolean(formErrors.experience_years)}
                      min="0"
                    />
                    {renderFieldError('experience_years')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee (BDT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.consultation_fee || ''}
                      onChange={(e) => setFieldValue('consultation_fee', e.target.value)}
                      className={getFieldClassName('consultation_fee')}
                      aria-invalid={Boolean(formErrors.consultation_fee)}
                      required
                    />
                    {renderFieldError('consultation_fee')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Follow-up Fee (BDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.follow_up_fee || ''}
                      onChange={(e) => setFieldValue('follow_up_fee', e.target.value)}
                      className={getFieldClassName('follow_up_fee')}
                      aria-invalid={Boolean(formErrors.follow_up_fee)}
                    />
                    {renderFieldError('follow_up_fee')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chamber Address</label>
                    <textarea
                      value={formData.chamber_address || ''}
                      onChange={(e) => setFormData({...formData, chamber_address: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Days (e.g., Mon,Tue,Wed)</label>
                    <input
                      type="text"
                      value={formData.available_days || ''}
                      onChange={(e) => setFormData({...formData, available_days: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Time Start</label>
                    <input
                      type="time"
                      value={formData.available_time_start || ''}
                      onChange={(e) => setFormData({...formData, available_time_start: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Time End</label>
                    <input
                      type="time"
                      value={formData.available_time_end || ''}
                      onChange={(e) => setFormData({...formData, available_time_end: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={formData.is_available !== false}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    <span className="admin-switch-control" aria-hidden="true"></span>
                    <span className="admin-switch-text">Make available for public (visible without login)</span>
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
                      type="text"
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
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <select
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="general">General Practitioner</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification *</label>
                    <select
                      value={formData.qualification || ''}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      required
                    >
                      <option value="">Select Qualification</option>
                      <option value="mbbs">MBBS</option>
                      <option value="md">MD</option>
                      <option value="ms">MS</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <input
                      type="number"
                      value={formData.experience_years || ''}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number *</label>
                    <input
                      type="text"
                      value={formData.registration_number || ''}
                      onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFieldValue('email', e.target.value)}
                      className={getFieldClassName('email')}
                      aria-invalid={Boolean(formErrors.email)}
                      required
                    />
                    {renderFieldError('email')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={(e) => setFieldValue('phone_number', e.target.value)}
                      className={getFieldClassName('phone_number')}
                      aria-invalid={Boolean(formErrors.phone_number)}
                      required
                    />
                    {renderFieldError('phone_number')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Fee *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.consultation_fee || ''}
                      onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation Availability *</label>
                    {getAvailabilitySchedule().map((availability, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          padding: '16px',
                          marginBottom: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <label className="form-label" style={{ marginBottom: '5px', fontSize: '12px' }}>Consultation Day</label>
                              <select
                                value={availability.day || ''}
                                onChange={(e) => updateAvailabilityRow(index, 'day', e.target.value)}
                                required
                                style={{ maxWidth: '260px' }}
                              >
                                <option value="">Select day</option>
                                {weekdayOptions.map((day) => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                            </div>
                            {getAvailabilitySchedule().length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAvailabilityRow(index)}
                                style={{
                                  border: '1px solid #fecaca',
                                  backgroundColor: '#fff5f5',
                                  color: '#b91c1c',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Remove Day
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 90px',
                              gap: '8px',
                              marginBottom: '6px',
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            <span>Start Time</span>
                            <span>End Time</span>
                            <span>Action</span>
                          </div>
                          {(availability.slots || [{ start_time: '', end_time: '' }]).map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 90px',
                                gap: '8px',
                                alignItems: 'center',
                                marginBottom: '8px',
                              }}
                            >
                              <input
                                type="time"
                                value={slot.start_time || ''}
                                onChange={(e) => updateAvailabilitySlot(index, slotIndex, 'start_time', e.target.value)}
                                required
                              />
                              <input
                                type="time"
                                value={slot.end_time || ''}
                                onChange={(e) => updateAvailabilitySlot(index, slotIndex, 'end_time', e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeAvailabilitySlot(index, slotIndex)}
                                disabled={(availability.slots || []).length === 1}
                                aria-label="Remove time slot"
                                title="Remove time slot"
                                style={{
                                  height: '38px',
                                  border: '1px solid #fecaca',
                                  backgroundColor: (availability.slots || []).length === 1 ? '#f8fafc' : '#fff5f5',
                                  color: (availability.slots || []).length === 1 ? '#94a3b8' : '#b91c1c',
                                  borderRadius: '6px',
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  cursor: (availability.slots || []).length === 1 ? 'not-allowed' : 'pointer',
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => addAvailabilitySlot(index)}
                            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                          >
                            + Add Time Slot
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary" onClick={addAvailabilityRow} style={{ width: '100%', borderRadius: '8px', padding: '10px 12px' }}>
                      + Add Another Day
                    </button>
                    {renderFieldError('availability_schedule')}
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={formData.is_available !== false}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    <span className="admin-switch-control" aria-hidden="true"></span>
                    <span className="admin-switch-text">Make available for public (visible without login)</span>
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
                      type="text"
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
                  <div className="form-group">
                    <label className="form-label">Hospital Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital Type *</label>
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
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upazila</label>
                    <input
                      type="text"
                      value={formData.upazila || ''}
                      onChange={(e) => setFormData({...formData, upazila: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone_primary || ''}
                      onChange={(e) => setFormData({...formData, phone_primary: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secondary Phone</label>
                    <input
                      type="tel"
                      value={formData.phone_secondary || ''}
                      onChange={(e) => setFormData({...formData, phone_secondary: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Beds</label>
                    <input
                      type="number"
                      value={formData.beds_total || ''}
                      onChange={(e) => setFormData({...formData, beds_total: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available Beds</label>
                    <input
                      type="number"
                      value={formData.beds_available || ''}
                      onChange={(e) => setFormData({...formData, beds_available: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Services (comma-separated)</label>
                    <textarea
                      value={formData.services || ''}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special Facilities (comma-separated)</label>
                    <textarea
                      value={formData.special_facilities || ''}
                      onChange={(e) => setFormData({...formData, special_facilities: e.target.value})}
                    />
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={formData.emergency_available || false}
                      onChange={(e) => setFormData({...formData, emergency_available: e.target.checked})}
                    />
                    <span className="admin-switch-control" aria-hidden="true"></span>
                    <span className="admin-switch-text">Emergency Available (24/7)</span>
                  </label>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="admin-switch-control" aria-hidden="true"></span>
                    <span className="admin-switch-text">Active Status</span>
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
                            type="text"
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
                            type="text"
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
                            type="text"
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
                  setFormErrors({});
                  setError(null);
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
