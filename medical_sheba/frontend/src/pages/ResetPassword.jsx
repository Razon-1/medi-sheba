// Search keyword: Page Reset Password - password reset confirmation form.
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, EyeOff, Eye, CheckCircle } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useSEO, pageMetadata } from '../utils/seo';

// Main component: renders password reset confirmation page.
export default function ResetPassword() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.resetPassword || { title: 'Reset Password - Medi Sheba' });
  
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError('Both password fields are required');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authAPI.confirmPasswordReset({
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setSuccess('Password has been reset successfully! You can now log in with your new password.');
      setFormData({ new_password: '', confirm_password: '' });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err.response?.data?.detail || 'Unable to reset password. Please try again or request a new reset link.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center">
          <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
            <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
              <div className="mx-auto w-full max-w-md text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Password reset successful</h2>
                <p className="mt-4 text-sm text-gray-600">
                  {success}
                </p>
                <div className="mt-6">
                  <Link 
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white transition hover:bg-primary-700"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Page layout: new password form, token validation feedback, and login link.
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Reset password</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Create a new password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter a new password for your account.
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

              {!token ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-700 mb-3">Invalid Reset Link</p>
                  <p className="text-sm text-amber-600 mb-4">
                    It looks like the reset link is invalid or expired. Please request a new password reset.
                  </p>
                  <Link 
                    to="/forgot-password"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-bold text-white transition hover:bg-amber-700"
                  >
                    Request New Reset Link
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-700">New Password</span>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters long.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Resetting password...' : 'Reset Password'}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link 
                  to="/login"
                  className="text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
