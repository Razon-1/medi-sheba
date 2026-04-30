import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';
import '../styles/pages/Auth.css';

export default function Login() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.login);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
      
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      
      if (err.response?.status === 401) {
        errorMsg = 'Invalid email or password. Please check and try again.';
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
          <h2>Login to Medi Sheba</h2>
          {error && <div className="error-message">{error}</div>}
          <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
