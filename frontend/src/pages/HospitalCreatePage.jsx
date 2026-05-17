import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import * as hospitalApi from '../api/hospitals';

const HospitalCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'private',
    address: '',
    district: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    website: '',
    beds_total: 0,
    emergency_available: false,
  });

  const hospitalTypes = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'clinic', label: 'Clinic' }
  ];

  const districts = [
    'Dhaka',
    'Chittagong',
    'Khulna',
    'Rajshahi',
    'Sylhet',
    'Barishal',
    'Mymensingh',
    'Rangpur'
  ];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    if (!token || !roles.includes('hospital_admin')) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Hospital name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.district) {
      setError('District is required');
      return;
    }
    if (!formData.phone_primary.trim()) {
      setError('Primary phone number is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hospital = await hospitalApi.createHospital(formData);
      console.log('Hospital created:', hospital);

      // Redirect to dashboard
      navigate('/hospital-admin');
    } catch (err) {
      console.error('Error creating hospital:', err);
      setError(err.message || 'Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hospital-container">
      <div className="header-banner">
        <h1>📋 Create Your Hospital</h1>
        <p>Set up your hospital profile to get started</p>
      </div>

      <div className="form-container">
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="form-group">
              <label>Hospital Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                {hospitalTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Total Beds</label>
              <input
                type="number"
                name="beds_total"
                value={formData.beds_total}
                onChange={handleChange}
                placeholder="Enter number of beds"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Primary Phone *</label>
              <input
                type="tel"
                name="phone_primary"
                value={formData.phone_primary}
                onChange={handleChange}
                placeholder="e.g., 01712345678"
                required
              />
            </div>

            <div className="form-group">
              <label>Secondary Phone</label>
              <input
                type="tel"
                name="phone_secondary"
                value={formData.phone_secondary}
                onChange={handleChange}
                placeholder="e.g., 01712345679"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hospital@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://hospital.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="emergency_available"
                  checked={formData.emergency_available}
                  onChange={handleChange}
                />
                24/7 Emergency Service Available
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating Hospital...' : 'Create Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalCreatePage;
