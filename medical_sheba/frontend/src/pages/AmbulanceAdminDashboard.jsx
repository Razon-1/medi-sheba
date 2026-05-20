import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import * as ambulanceApi from '../api/ambulance';
import { uploadImage } from '../api/hospitals';
import { validateBangladeshPhone } from '../utils/validators';
import { AdminSubscriptionPrompt, useAdminSubscriptionAccess } from '../components/AdminSubscriptionAccess';
import '../styles/AdminDashboard.css';

const emptyAmbulance = {
  name: '',
  vehicle_type: 'basic',
  driver_name: '',
  phone_number: '',
  email: '',
  address: '',
  cost_per_km: '',
  image_url: '',
  image_file: null,
  is_available: true,
};

const statusOptions = ['pending', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'];

const getData = (response) => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : (data?.results || []);
};

export default function AmbulanceAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    checkingAccess,
    accessState,
    accessError,
    trialLoading,
    startTrial,
  } = useAdminSubscriptionAccess('ambulance_driver_admin');
  const [activeTab, setActiveTab] = useState('ambulances');
  const [ambulances, setAmbulances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyAmbulance);
  const [distanceInputs, setDistanceInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [reviewPeriod, setReviewPeriod] = useState('weekly');
  const canManageAmbulance = Boolean(
    user?.is_superuser || user?.roles?.includes('admin') || user?.roles?.includes('ambulance_driver_admin')
  );

  useEffect(() => {
    if (user && !canManageAmbulance) {
      navigate('/');
    }
  }, [canManageAmbulance, navigate, user]);

  useEffect(() => {
    if (accessState !== 'active' || !canManageAmbulance) return;
    loadDashboard();
  }, [activeTab, accessState, canManageAmbulance, statusFilter, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'ambulances') {
        const response = await ambulanceApi.getMyAmbulances();
        setAmbulances(getData(response));
      } else {
        const response = await ambulanceApi.getAmbulanceAdminRequests(activeTab === 'requests' ? statusFilter || null : null);
        const requestList = getData(response);
        setRequests(requestList);
        setDistanceInputs(
          requestList.reduce((values, request) => ({
            ...values,
            [request.id]: request.distance_km || '',
          }), {})
        );
      }
    } catch (err) {
      const message = err?.response?.data?.detail || err?.response?.data?.error || err.message || 'Failed to load ambulance dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const revenue = useMemo(() => {
    return requests
      .filter((request) => request.payment_status === 'paid' || request.status === 'completed')
      .reduce((total, request) => total + Number.parseFloat(request.final_fare || request.estimated_fare || 0), 0);
  }, [requests]);

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
    return date instanceof Date && !Number.isNaN(date) ? date : null;
  };

  const formatCurrency = (amount) => {
    return `BDT ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPeriodRequests = () => {
    const periodStart = getPeriodStart(reviewPeriod);
    return requests.filter((request) => {
      const created = parseDateValue(request.created_at || request.updated_at);
      return created && created >= periodStart;
    });
  };

  const getRevenueBreakdown = () => {
    const periodRequests = getPeriodRequests();
    const completedRevenue = periodRequests
      .filter((request) => request.status === 'completed')
      .reduce((sum, request) => sum + Number.parseFloat(request.final_fare || request.estimated_fare || 0), 0);
    const pendingRevenue = periodRequests
      .filter((request) => request.status !== 'completed')
      .reduce((sum, request) => sum + Number.parseFloat(request.final_fare || request.estimated_fare || 0), 0);

    return [
      { label: 'Completed', value: completedRevenue, color: '#1d72b8' },
      { label: 'Pending', value: pendingRevenue, color: '#f59e0b' }
    ];
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
            <path key={item.label} d={pathData} fill={item.color}>
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

  const handleAddClick = () => {
    if (!user?.is_superuser && ambulances.length >= 1) {
      setError('You already added an ambulance. One ambulance driver admin can manage only one ambulance.');
      return;
    }
    setEditingItem(null);
    setFormData(emptyAmbulance);
    setFormErrors({});
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleEditClick = (ambulance) => {
    setEditingItem(ambulance);
    setFormData({
      ...emptyAmbulance,
      ...ambulance,
      cost_per_km: ambulance.cost_per_km || '',
    });
    setFormErrors({});
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ambulance?')) return;
    try {
      setError('');
      setSuccess('');
      await ambulanceApi.deleteAmbulance(id);
      setAmbulances((current) => current.filter((ambulance) => ambulance.id !== id));
      setSuccess('Ambulance deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.error || err.message || 'Failed to delete ambulance';
      setError(errorMsg);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Service name is required';
    }

    if (!formData.driver_name || formData.driver_name.trim() === '') {
      errors.driver_name = 'Driver name is required';
    }

    if (!formData.phone_number || formData.phone_number.trim() === '') {
      errors.phone_number = 'Phone number is required';
    } else if (!validateBangladeshPhone(formData.phone_number)) {
      errors.phone_number = 'Invalid Bangladesh phone number (e.g., 01712345678 or +8801712345678)';
    }

    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email address';
      }
    }

    if (!formData.cost_per_km || Number.parseFloat(formData.cost_per_km) <= 0) {
      errors.cost_per_km = 'Cost per KM must be greater than 0';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});
      
      // Build payload, excluding read-only fields
      const payload = {
        name: formData.name,
        vehicle_type: formData.vehicle_type,
        driver_name: formData.driver_name,
        phone_number: formData.phone_number,
        email: formData.email || '',
        address: formData.address || '',
        cost_per_km: Number.parseFloat(formData.cost_per_km || 0),
        image_url: formData.image_url || editingItem?.image_url || '',
        is_available: formData.is_available !== false,
      };

      if (formData.image_file) {
        const uploadRes = await uploadImage(formData.image_file);
        payload.image_url = uploadRes.data.image_url;
      }

      if (editingItem) {
        const response = await ambulanceApi.updateAmbulance(editingItem.id, payload);
        const updated = response?.data || response;
        setAmbulances((current) => current.map((ambulance) => ambulance.id === updated.id ? updated : ambulance));
        setSuccess('Ambulance updated successfully');
      } else {
        const response = await ambulanceApi.addAmbulance(payload);
        const created = response?.data || response;
        setAmbulances((current) => [...current, created]);
        setSuccess('Ambulance added successfully');
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData(emptyAmbulance);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Extract error message properly
      let errorMsg = 'Failed to save ambulance';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          // Handle field-specific errors
          const fieldErrors = {};
          let generalError = '';
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              fieldErrors[key] = value[0];
            } else if (typeof value === 'string') {
              fieldErrors[key] = value;
              if (!generalError) generalError = value;
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            setFormErrors(fieldErrors);
          }
          if (generalError) {
            errorMsg = generalError;
          }
        }
      }
      setError(err?.response?.data?.detail || errorMsg || err.message);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setError('');
      setSuccess('');
      const response = await ambulanceApi.updateAmbulanceRequestStatus(requestId, status);
      const updated = response?.data || response;
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request));
      setSuccess('Request status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to update request status');
    }
  };

  const handleFareUpdate = async (requestId) => {
    const distanceKm = Number.parseFloat(distanceInputs[requestId]);
    if (!distanceKm || distanceKm <= 0) {
      setError('Please enter a valid distance in km');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await ambulanceApi.updateAmbulanceRequestFare(requestId, distanceKm);
      const updated = response?.data || response;
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request));
      setDistanceInputs((current) => ({ ...current, [requestId]: updated.distance_km || distanceKm }));
      setSuccess('Final fare updated from distance');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || err.message || 'Failed to update fare');
    }
  };

  const AmbulancesTab = () => (
    <div className="admin-content">
      <h2>Manage Ambulances</h2>
      {user?.is_superuser || ambulances.length === 0 ? (
        <button className="btn btn-primary" onClick={handleAddClick}>+ Add Ambulance</button>
      ) : (
        <div className="info-card" style={{ marginBottom: 16 }}>
          <p><strong>One ambulance only:</strong> You can edit or delete your existing ambulance, but cannot add another one.</p>
        </div>
      )}
      {ambulances.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No ambulances found. Click "Add Ambulance" to create one.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Vehicle Type</th>
              <th>Driver</th>
              <th>Phone</th>
              <th>Fare/KM</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ambulances.map((ambulance) => (
              <tr key={ambulance.id}>
                <td>{ambulance.name}</td>
                <td>{ambulance.vehicle_type}</td>
                <td>{ambulance.driver_name}</td>
                <td>{ambulance.phone_number}</td>
                <td>BDT {Number.parseFloat(ambulance.cost_per_km || 0).toFixed(2)} per km</td>
                <td>{ambulance.is_available ? 'Available' : 'Unavailable'}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditClick(ambulance)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(ambulance.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const RequestsTab = () => (
    <div className="admin-content">
      <div className="review-header">
        <div>
          <h2>Ambulance Requests</h2>
          <p>Track bookings assigned to your ambulance services.</p>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="revenue-card" style={{ marginBottom: 16 }}>
        <p>Total Request Revenue</p>
        <strong>BDT {revenue.toFixed(2)}</strong>
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No ambulance requests found{statusFilter ? ` with status "${statusFilter.replaceAll('_', ' ')}"` : ''}.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Patient</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Distance</th>
              <th>Fare</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const isFinalStatus = ['completed', 'cancelled'].includes(request.status);
              return (
                <tr key={request.id}>
                  <td>{request.request_id}</td>
                  <td>{request.patient_name}<br />{request.contact_phone}</td>
                  <td>{request.pickup_location}</td>
                  <td>{request.dropoff_location}</td>
                  <td>{request.urgency}</td>
                  <td>{request.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 150 }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={distanceInputs[request.id] || ''}
                        onChange={(event) => setDistanceInputs((current) => ({ ...current, [request.id]: event.target.value }))}
                        placeholder="km"
                        style={{ width: 80 }}
                        disabled={isFinalStatus}
                      />
                      <button type="button" className="btn-edit" onClick={() => handleFareUpdate(request.id)} disabled={isFinalStatus}>
                        Set
                      </button>
                    </div>
                  </td>
                  <td>BDT {Number.parseFloat(request.final_fare || request.estimated_fare || 0).toFixed(2)}</td>
                  <td>
                    {isFinalStatus ? (
                      <span style={{ color: request.status === 'completed' ? '#198754' : '#dc3545', fontWeight: 700 }}>
                        {request.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    ) : (
                      <select
                        value={request.status}
                        onChange={(event) => handleStatusUpdate(request.id, event.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const RevenueReviewTab = () => {
    const periodRequests = getPeriodRequests();
    const breakdown = getRevenueBreakdown();
    const completedRevenue = breakdown.find((item) => item.label === 'Completed')?.value || 0;
    const pendingRevenue = breakdown.find((item) => item.label === 'Pending')?.value || 0;
    const totalRevenue = completedRevenue;
    const chartTotal = breakdown.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="review-tab">
        <div className="review-header">
          <div>
            <h2>Revenue Review</h2>
            <p>View ambulance booking earnings by period and request status.</p>
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

        <div className="review-grid">
          <div className="review-summary">
            <div className="revenue-card">
              <p>Total Revenue</p>
              <strong>{formatCurrency(totalRevenue)}</strong>
              <small>{periodRequests.length} requests in period</small>
            </div>
            <div className="revenue-card">
              <p>Completed Earnings</p>
              <strong>{formatCurrency(completedRevenue)}</strong>
              <small>Completed ambulance requests</small>
            </div>
            <div className="revenue-card">
              <p>Pending Fare</p>
              <strong>{formatCurrency(pendingRevenue)}</strong>
            </div>
          </div>

          <div className="review-chart-card">
            <div className="review-chart-title">Revenue by Request Status</div>
            {renderPieChart(breakdown)}
            <div className="pie-legend">
              {breakdown.map((item) => (
                <div key={item.label} className="pie-legend-item">
                  <div className="pie-legend-main">
                    <span className="pie-dot" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <strong className="pie-legend-value">
                    {formatCurrency(item.value)} - {getRevenuePercentage(item.value, chartTotal)}%
                  </strong>
                </div>
              ))}
            </div>
            {chartTotal === 0 && (
              <div className="empty-pie">Add completed ambulance bookings to see the pie split dynamically.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!canManageAmbulance) {
    return null;
  }

  if (checkingAccess || accessState !== 'active') {
    return (
      <AdminSubscriptionPrompt
        accessState={checkingAccess ? 'checking' : accessState}
        accessError={accessError}
        trialLoading={trialLoading}
        onStartTrial={startTrial}
        serviceName="ambulance admin services"
        loadingTitle="Loading Ambulance Access"
        loadingText="Checking your subscription and ambulance access..."
      />
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Ambulance Driver Admin Dashboard</h1>
        <p>Open, update, and control your ambulance service from one place.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'ambulances' ? 'active' : ''}`}
          onClick={() => setActiveTab('ambulances')}
        >
          Ambulances
        </button>
        <button
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
        <button
          className={`tab-button ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          Revenue Review
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading ambulance dashboard...</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'ambulances' && <AmbulancesTab />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'review' && <RevenueReviewTab />}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>{editingItem ? 'Edit Ambulance' : 'Add Ambulance'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Service Name *"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#333' }}>Vehicle Type *</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(event) => setFormData({ ...formData, vehicle_type: event.target.value })}
                  required
                >
                  <option value="basic">Basic Ambulance</option>
                  <option value="advanced">Advanced Life Support</option>
                  <option value="icu">ICU Ambulance</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Driver Name *"
                  value={formData.driver_name}
                  onChange={(event) => setFormData({ ...formData, driver_name: event.target.value })}
                  className={formErrors.driver_name ? 'input-error' : ''}
                />
                {formErrors.driver_name && <span className="field-error">{formErrors.driver_name}</span>}
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone Number * (e.g., 01712345678)"
                  value={formData.phone_number}
                  onChange={(event) => setFormData({ ...formData, phone_number: event.target.value })}
                  className={formErrors.phone_number ? 'input-error' : ''}
                />
                {formErrors.phone_number && <span className="field-error">{formErrors.phone_number}</span>}
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ''}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className={formErrors.email ? 'input-error' : ''}
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Service Address"
                  value={formData.address || ''}
                  onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                />
              </div>

              <div className="form-group">
                <input
                  type="number"
                  placeholder="Fare Per KM (BDT) *"
                  step="0.01"
                  min="0"
                  value={formData.cost_per_km}
                  onChange={(event) => setFormData({ ...formData, cost_per_km: event.target.value })}
                  className={formErrors.cost_per_km ? 'input-error' : ''}
                />
                <small style={{ display: 'block', marginTop: '6px', color: '#666' }}>
                  Admin sets the taka amount for 1 km. Final fare is calculated from trip distance.
                </small>
                {formErrors.cost_per_km && <span className="field-error">{formErrors.cost_per_km}</span>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#333' }}>Ambulance Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFormData({ ...formData, image_file: event.target.files[0] })}
                />
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={formData.image_url || ''}
                  onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div className="form-group">
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={formData.is_available !== false}
                    onChange={(event) => setFormData({ ...formData, is_available: event.target.checked })}
                  />
                  <span className="admin-switch-control" aria-hidden="true"></span>
                  <span className="admin-switch-text">Available for bookings</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
