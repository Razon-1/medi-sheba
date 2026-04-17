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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
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
