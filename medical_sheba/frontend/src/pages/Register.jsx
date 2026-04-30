import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Auth.css';

export default function Register() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.register);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Split full name into first_name and last_name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
      };

      console.log('Registration payload:', payload);

      await register(payload);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract error message from various possible response formats
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          // Handle field-specific errors
          const errors = [];
          for (const [field, messages] of Object.entries(err.response.data)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          }
          if (errors.length > 0) {
            errorMsg = errors.join(' | ');
          }
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <h2>Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          <AuthForm type="register" onSubmit={handleRegister} loading={loading} />
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
