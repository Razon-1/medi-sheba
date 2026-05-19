import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import * as ambulanceApi from '../api/ambulance';
import { validateBangladeshPhone } from '../utils/validators';
import '../styles/AdminDashboard.css';

const emptyAmbulance = {
  name: '',
  vehicle_type: 'basic',
  driver_name: '',
  phone_number: '',
  email: '',
  address: '',
  cost_per_km: '',
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

  useEffect(() => {
    if (user && !user.roles.includes('ambulance_driver_admin')) {
      navigate('/');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user?.roles?.includes('ambulance_driver_admin')) return;
    loadDashboard();
  }, [activeTab, statusFilter, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'ambulances') {
        const response = await ambulanceApi.getMyAmbulances();
        setAmbulances(getData(response));
      } else {
        const response = await ambulanceApi.getAmbulanceAdminRequests(statusFilter || null);
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

  const handleAddClick = () => {
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
        is_available: formData.is_available !== false,
      };

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
      <button className="btn btn-primary" onClick={handleAddClick}>+ Add Ambulance</button>
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
            {requests.map((request) => (
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
                    />
                    <button type="button" className="btn-edit" onClick={() => handleFareUpdate(request.id)}>
                      Set
                    </button>
                  </div>
                </td>
                <td>BDT {Number.parseFloat(request.final_fare || request.estimated_fare || 0).toFixed(2)}</td>
                <td>
                  <select
                    value={request.status}
                    onChange={(event) => handleStatusUpdate(request.id, event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (!user?.roles?.includes('ambulance_driver_admin')) {
    return null;
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
      </div>

      {loading ? (
        <div className="loading">Loading ambulance dashboard...</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'ambulances' && <AmbulancesTab />}
          {activeTab === 'requests' && <RequestsTab />}
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
                {editingItem && (
                  <>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#333' }}>Vehicle Type</label>
                    <p style={{ padding: '10px 12px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', color: '#333', fontWeight: '500', margin: '0' }}>
                      {formData.vehicle_type === 'basic' ? 'Basic Ambulance' : formData.vehicle_type === 'advanced' ? 'Advanced Life Support' : 'ICU Ambulance'}
                    </p>
                  </>
                )}
                {!editingItem && (
                  <>
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
                  </>
                )}
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
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_available !== false}
                    onChange={(event) => setFormData({ ...formData, is_available: event.target.checked })}
                  />
                  Available for bookings
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
