// Search keyword: Page Forgot Password - password reset request form.
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useSEO, pageMetadata } from '../utils/seo';

// Main component: renders forgot password request page.
export default function ForgotPassword() {
  // Set SEO metadata for this page
  useSEO(pageMetadata.forgotPassword || { title: 'Forgot Password - Medi Sheba' });
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email address is required');
      return;
    }

    try {
      setLoading(true);
      await authAPI.requestPasswordReset(email.trim());
      
      setSuccess('If an account with this email exists, a password reset link has been sent. Please check your email.');
      setEmail('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      const errorMessage = err.response?.data?.detail || 'Unable to process your request. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Page layout: password reset request form and success/error feedback.
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Forgot password?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter the email address associated with your account, and we'll send you a link to reset your password.
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

              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <span className="text-xs font-bold text-white">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">{success}</p>
                    <p className="mt-1 text-xs text-emerald-600">Redirecting you to login in 3 seconds...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Email Address</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={loading || !!success}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || !!success}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Sending reset link...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>
              </div>

              <p className="mt-6 text-xs leading-6 text-gray-500 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                  Create one now
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
