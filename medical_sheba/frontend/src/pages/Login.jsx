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
  const [recoveryError, setRecoveryError] = useState(null);
  const [recoverySuccess, setRecoverySuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    phone: '',
    new_password: '',
    confirm_password: '',
  });
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
      
      await login(formData.email, formData.password, selectedRole);
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

      if (err.response?.status === 403) {
        errorMsg = err.response?.data?.detail || 'This account is not registered for the selected role.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryChange = (event) => {
    const { name, value } = event.target;
    setRecoveryData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordRecovery = async (event) => {
    event.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryData.email || !recoveryData.phone || !recoveryData.new_password) {
      setRecoveryError('Email, registered phone, and new password are required');
      return;
    }

    if (recoveryData.new_password.length < 6) {
      setRecoveryError('New password must be at least 6 characters long');
      return;
    }

    if (recoveryData.new_password !== recoveryData.confirm_password) {
      setRecoveryError('Passwords do not match');
      return;
    }

    try {
      setRecoveryLoading(true);
      const { data } = await authAPI.recoverPassword({
        email: recoveryData.email.trim(),
        phone: recoveryData.phone.trim(),
        new_password: recoveryData.new_password,
      });
      setRecoverySuccess(data?.detail || 'Password updated successfully. You can now log in.');
      setRecoveryData({
        email: '',
        phone: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Unable to reset password. Please try again.';
      setRecoveryError(message);
    } finally {
      setRecoveryLoading(false);
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

              <div className="mt-4 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery((value) => !value);
                    setRecoveryError(null);
                    setRecoverySuccess(null);
                  }}
                  className="text-sm font-bold text-primary-600 transition hover:text-primary-700"
                >
                  {showRecovery ? 'Back to sign in' : 'Forgot password?'}
                </button>
              </div>

              {showRecovery && (
                <form onSubmit={handlePasswordRecovery} className="mt-6 rounded-lg border border-primary-100 bg-primary-50/40 p-4">
                  <h3 className="text-lg font-bold text-gray-900">Reset password</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter your account email and registered phone number to set a new password.
                  </p>

                  {recoveryError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                      {recoveryError}
                    </div>
                  )}

                  {recoverySuccess && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                      {recoverySuccess}
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={recoveryData.email}
                        onChange={handleRecoveryChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Enter account email"
                        autoComplete="email"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">Registered Phone</span>
                      <input
                        type="tel"
                        name="phone"
                        value={recoveryData.phone}
                        onChange={handleRecoveryChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Enter registered phone"
                        autoComplete="tel"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">New Password</span>
                      <input
                        type="password"
                        name="new_password"
                        value={recoveryData.new_password}
                        onChange={handleRecoveryChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</span>
                      <input
                        type="password"
                        name="confirm_password"
                        value={recoveryData.confirm_password}
                        onChange={handleRecoveryChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {recoveryLoading ? 'Updating password...' : 'Update Password'}
                  </button>
                </form>
              )}

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
