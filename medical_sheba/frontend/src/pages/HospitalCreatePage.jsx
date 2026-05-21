// Search keyword: Page Hospital Create - hospital admin setup and subscription flow.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';
import paymentsAPI from '../api/payments';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/App.css';
import * as hospitalApi from '../api/hospitals';

// Main component: renders hospital creation and subscription setup page.
const HospitalCreatePage = () => {
  useSEO(pageMetadata.hospitalCreate);

  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Corrected context
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [accessState, setAccessState] = useState('checking');
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
    if (user && !user.roles.includes('hospital_admin')) {
      navigate('/');
      return;
    }
    let cancelled = false;

    const checkAccess = async () => {
      try {
        if (!user) {
          if (!cancelled) {
            setCheckingExisting(false);
            setAccessState('none');
          }
          return;
        }

        const activeSubscription = await paymentsAPI.getActiveSubscription();
        if (!activeSubscription) {
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

        const hospital = await hospitalApi.getMyHospital().catch(() => null);
        if (hospital && !cancelled) {
          navigate('/hospital-admin', { replace: true });
          return;
        }

        if (!cancelled) {
          setCheckingExisting(false);
          setAccessState('active');
        }
      } catch (err) {
        if (!cancelled) {
          setCheckingExisting(false);
          setAccessState('none');
        }
      }
    };

    checkAccess();

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
      // update user flag locally
      if (res && user) {
        const updated = { ...user, has_made_first_payment: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setAccessState('active');
    } catch (err) {
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

  if (checkingExisting) {
    return (
      <div className="subscription-required">
        <div className="subscription-box">
          <h2>Loading Hospital Setup</h2>
          <p>Checking your current access and hospital profile...</p>
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
              ? 'Your free trial ended. Please choose a monthly or yearly plan to continue creating your hospital.'
              : 'Start your free trial to unlock hospital creation.'}
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
          {error && accessState !== 'expired' && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // Page layout: subscription access state, hospital creation form, and payment/trial actions.
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
