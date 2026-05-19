import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import useAuthStore from '../context/authStore';
import { authAPI } from '../api/auth';
import { useSEO, pageMetadata } from '../utils/seo';

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

      const selectedRole = formData.roles?.[0];
      if (!selectedRole) {
        setError('Please select your login role');
        setLoading(false);
        return;
      }
      
      const data = await login(formData.email, formData.password, selectedRole);
      navigate(data.user?.is_superuser || data.user?.roles?.includes('admin') ? '/super-admin' : '/');
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

      if (err.response?.status === 403) {
        errorMsg = err.response?.data?.detail || 'This account is not registered for the selected role.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Sign in</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Access your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email and password to continue.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              <AuthForm type="login" onSubmit={handleLogin} loading={loading} />

              <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <p>Do not have an account?</p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 font-bold text-primary-600 transition hover:text-primary-700"
                >
                  Create one now
                  <ArrowRight size={16} />
                </Link>
              </div>

              <p className="mt-6 text-xs leading-6 text-gray-500">
                By logging in, you agree to our{' '}
                <Link to="/terms" className="font-semibold text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="font-semibold text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
