import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { medicineAPI } from '../api/emedicine';
import '../styles/pages/PharmacyCreatePage.css';

export default function PharmacyCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    pharmacy_type: 'chain',
    license_number: '',
    phone_number: '',
    email: '',
    address: '',
    district: '',
    upazila: '',
    delivery_time_hours: 24,
    min_order_amount: 100,
    delivery_charge: 50,
  });

  const pharmacyTypes = [
    { value: 'chain', label: 'Chain Pharmacy' },
    { value: 'independent', label: 'Independent Pharmacy' },
    { value: 'hospital', label: 'Hospital Pharmacy' }
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

  const upazilas = {
    'Dhaka': ['Dhaka Sadar', 'Gulshan', 'Dhanmondi', 'Mirpur', 'Uttara'],
    'Chittagong': ['Chittagong Sadar', 'Halishahar', 'Nasirabad'],
    'Khulna': ['Khulna Sadar', 'Satkhira'],
    'Rajshahi': ['Rajshahi Sadar', 'Natore'],
    'Sylhet': ['Sylhet Sadar', 'Moulvibazar'],
    'Barishal': ['Barishal Sadar', 'Pirojpur'],
    'Mymensingh': ['Mymensingh Sadar', 'Jamalpur'],
    'Rangpur': ['Rangpur Sadar', 'Gaibandha']
  };

  useEffect(() => {
    if (user && !user.roles.includes('pharmacy_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Pharmacy name is required');
      return;
    }
    if (!formData.license_number.trim()) {
      setError('License number is required');
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
    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pharmacy = await medicineAPI.createPharmacy(formData);
      console.log('Pharmacy created:', pharmacy);

      // Redirect to pharmacy admin dashboard
      navigate('/pharmacy-admin');
    } catch (err) {
      console.error('Error creating pharmacy:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create pharmacy');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.roles.includes('pharmacy_admin')) {
    return null;
  }

  return (
    <div className="pharmacy-create-container">
      <div className="create-header">
        <h1>💊 Create Your Pharmacy</h1>
        <p>Set up your pharmacy profile to start managing medicines and orders</p>
      </div>

      <div className="create-form-container">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pharmacy-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>📝 Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Pharmacy Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., MediCare Plus Pharmacy"
                  required
                />
              </div>

              <div className="form-group">
                <label>Pharmacy Type *</label>
                <select
                  name="pharmacy_type"
                  value={formData.pharmacy_type}
                  onChange={handleChange}
                  required
                >
                  {pharmacyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="e.g., PHARM2024001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="pharmacy@example.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>📞 Contact Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+880-1700-000000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>📍 Location</h3>
            
            <div className="form-row">
              <div className="form-group">
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
                <label>Upazila</label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                >
                  <option value="">Select Upazila</option>
                  {formData.district && upazilas[formData.district]?.map(upazila => (
                    <option key={upazila} value={upazila}>{upazila}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="form-section">
            <h3>🚚 Service Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Delivery Time (hours)</label>
                <input
                  type="number"
                  name="delivery_time_hours"
                  value={formData.delivery_time_hours}
                  onChange={handleChange}
                  min="1"
                  max="72"
                  placeholder="24"
                />
              </div>

              <div className="form-group">
                <label>Minimum Order Amount (৳)</label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  min="0"
                  placeholder="100"
                />
              </div>

              <div className="form-group">
                <label>Delivery Charge (৳)</label>
                <input
                  type="number"
                  name="delivery_charge"
                  value={formData.delivery_charge}
                  onChange={handleChange}
                  min="0"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating Pharmacy...' : '✓ Create Pharmacy'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="form-info">
            💡 Once created, you can manage medicines, orders, and deliveries from your pharmacy dashboard. 
            One pharmacy admin can manage only one pharmacy.
          </p>
        </form>
      </div>
    </div>
  );
}
