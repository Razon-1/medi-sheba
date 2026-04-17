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

      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
