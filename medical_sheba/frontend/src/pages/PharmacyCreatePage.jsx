// Search keyword: Page Pharmacy Create - pharmacy admin setup and subscription flow.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import { medicineAPI } from '../api/emedicine';
import { uploadImage } from '../api/hospitals';
import paymentsAPI from '../api/payments';
import '../styles/pages/PharmacyCreatePage.css';
import '../styles/App.css';

// Main component: renders pharmacy creation and subscription setup page.
export default function PharmacyCreatePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [accessState, setAccessState] = useState('checking');
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
    image_url: '',
    image_file: null,
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
      return;
    }
    let cancelled = false;

    const checkExistingPharmacy = async () => {
      try {
        if (!user) {
          if (!cancelled) {
            setAccessState('none');
            setCheckingExisting(false);
          }
          return;
        }

        const activeSubscription = await paymentsAPI.getActiveSubscription();
        const hasActiveAccess = Boolean(activeSubscription);

        if (!hasActiveAccess) {
          if (!cancelled) {
            setCheckingExisting(false);
            setAccessState(user.has_made_first_payment ? 'expired' : 'none');
          }
          return;
        }

        if (user && !user.has_made_first_payment && !cancelled) {
          const updated = { ...user, has_made_first_payment: true };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        }

        const response = await medicineAPI.getMyPharmacy().catch(() => null);
        if (response && !cancelled) {
          navigate('/pharmacy-admin', { replace: true });
          return;
        }

        if (!cancelled) {
          setCheckingExisting(false);
          setAccessState('active');
        }
      } catch (err) {
        if (!cancelled) {
          setCheckingExisting(false);
          setAccessState(err?.response?.status === 404 ? (user?.has_made_first_payment ? 'expired' : 'none') : 'none');
        }
      }
    };

    checkExistingPharmacy();

    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  const handleStartTrial = async () => {
    try {
      setError(null);
      setLoading(true);
      const paymentsAPI = (await import('../api/payments')).default;
      const res = await paymentsAPI.startTrial();
      if (res && user) {
        const updated = { ...user, has_made_first_payment: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setAccessState('active');
    } catch (err) {
      // If unauthenticated or forbidden, suggest buying a plan or logging in
      if (err.status === 401) {
        setError('You must be logged in to start a trial. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
        return;
      }
      if (err.status === 403) {
        setError(err.detail || 'You are not eligible for a free trial.');
        return;
      }
      setError(err.detail || err.message || 'Failed to start trial');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : (type === 'number' ? parseInt(value) || 0 : value)
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

      let uploadedImageUrl = formData.image_url || '';
      if (formData.image_file) {
        const uploadRes = await uploadImage(formData.image_file);
        uploadedImageUrl = uploadRes.data.image_url;
      }

      const payload = {
        name: formData.name.trim(),
        pharmacy_type: formData.pharmacy_type,
        license_number: formData.license_number.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        district_name: formData.district,
        upazila_name: formData.upazila || '',
        delivery_time_hours: Number(formData.delivery_time_hours) || 24,
        min_order_amount: Number(formData.min_order_amount) || 0,
        delivery_charge: Number(formData.delivery_charge) || 0,
        image_url: uploadedImageUrl,
      };

      const pharmacy = await medicineAPI.createPharmacy(payload);
      console.log('Pharmacy created:', pharmacy);

      // Redirect to pharmacy admin dashboard
      navigate('/pharmacy-admin');
    } catch (err) {
      console.error('Error creating pharmacy:', err);
      const apiDetail = err.response?.data?.detail || err.response?.data?.error;
      const fieldErrors = err.response?.data && typeof err.response.data === 'object'
        ? Object.entries(err.response.data)
            .filter(([key]) => !['detail', 'error'].includes(key))
            .map(([, value]) => Array.isArray(value) ? value.join(' ') : String(value))
            .join(' ')
        : '';
      setError(apiDetail || fieldErrors || err.message || 'Failed to create pharmacy');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.roles.includes('pharmacy_admin')) {
    return null;
  }

  if (checkingExisting) {
    return (
      <div className="subscription-required">
        <div className="subscription-box">
          <h2>Loading Pharmacy Setup</h2>
          <p>Checking your existing pharmacy profile...</p>
        </div>
      </div>
    );
  }

  if (accessState !== 'active') {
    return (
      <div className="subscription-required">
        <div className="subscription-box">
          <h2>{accessState === 'expired' ? 'Trial Expired' : 'Subscription Required'}</h2>
          <p>
            {accessState === 'expired'
              ? 'Your free trial ended. Please choose a monthly or yearly plan to continue creating your pharmacy.'
              : 'Start your free trial to unlock pharmacy creation.'}
          </p>
          <div style={{display: 'flex', gap: '12px', marginTop: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
            {accessState !== 'expired' && (
              <div style={{flex: '1 1 260px', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.07)'}}>
              <div style={{fontWeight:800, fontSize:16}}>Free Trial</div>
              <div style={{fontSize:13, opacity:0.95, marginTop: 4}}>3 days • No upfront payment • Continue to setup after activation</div>
            </div>
            )}
            {accessState === 'expired' && (
              <div style={{flex: '1 1 260px', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.07)'}}>
                <div style={{fontWeight:800, fontSize:16}}>Paid Plans</div>
                <div style={{fontSize:13, opacity:0.95, marginTop: 4}}>Monthly and yearly access unlock continued create access after successful payment.</div>
              </div>
            )}
          </div>
          <div className="subscription-actions">
            {accessState === 'expired' ? (
              <button className="btn-primary" onClick={() => navigate('/#subscription-plans')}>
                Choose Paid Plan
              </button>
            ) : (
              <button className="btn-outline" onClick={handleStartTrial} disabled={loading}>
                {loading ? 'Starting Trial...' : 'Continue Free Trial'}
              </button>
            )}
          </div>
          {error && accessState !== 'expired' && <div className="error-banner"><span>{error}</span></div>}
        </div>
      </div>
    );
  }

  // Page layout: subscription access state, pharmacy creation form, and payment/trial actions.
  return (
    <div className="pharmacy-create-container">
      <div className="create-header">
        <div className="header-pill">Free Trial Enabled</div>
        <h1>💊 Create Your Pharmacy</h1>
        <p>Set up your pharmacy profile to start managing medicines, stock, and orders with a clean responsive dashboard experience.</p>
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

          <div className="form-section">
            <h3>Pharmacy Image</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Upload Image</label>
                <input
                  type="file"
                  name="image_file"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Or Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/pharmacy.jpg"
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
