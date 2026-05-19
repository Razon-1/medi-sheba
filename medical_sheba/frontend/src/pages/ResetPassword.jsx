import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useSEO, pageMetadata } from '../utils/seo';

export default function ResetPassword() {
  useSEO({
    title: 'Reset Password - Medi Sheba',
    description: 'Reset your Medi Sheba account password',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      setValidatingToken(false);
      return;
    }
    // Token validation will happen on form submission
    setTokenValid(true);
    setValidatingToken(false);
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const { data } = await authAPI.confirmPasswordReset({
        token,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });
      
      setSuccess(true);
      setFormData({ newPassword: '', confirmPassword: '' });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.detail || 
                     err.response?.data?.message || 
                     'Unable to reset password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center">
          <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
            <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
              <div className="mb-7 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Error</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Invalid Reset Link</h2>
              </div>

              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                    <p className="mt-1 text-sm text-red-600">
                      Reset links expire after 24 hours for security purposes.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/forgot-password"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary-600 px-5 text-base font-bold text-white transition hover:bg-primary-700"
              >
                Request New Reset Link
              </Link>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <Link
                  to="/login"
                  className="text-center text-sm font-bold text-primary-600 transition hover:text-primary-700"
                >
                  Back to login
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mb-7 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Create New Password</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Reset your password</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter a new password for your account.
              </p>
            </div>

            {success && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-900">Password reset successful!</h3>
                    <p className="mt-1 text-sm text-emerald-700">
                      Redirecting to login page...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">New Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-base font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-primary-600 transition hover:text-primary-700"
                  >
                    Sign in here
                  </Link>
                </p>
              </form>
            )}

            <div className="mt-6 border-t border-gray-200 pt-6">
              <Link
                to="/login"
                className="text-center text-sm font-bold text-primary-600 transition hover:text-primary-700 block"
              >
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
