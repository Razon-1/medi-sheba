import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../api/auth';
import { useSEO, pageMetadata } from '../utils/seo';

export default function ForgotPassword() {
  useSEO({
    title: 'Forgot Password - Medi Sheba',
    description: 'Reset your Medi Sheba account password',
  });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      console.log('Requesting password reset for:', email);
      const { data } = await authAPI.requestPasswordReset(email);
      console.log('Password reset response:', data);
      setSuccess(true);
      setEmail('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      console.error('Error response:', err.response?.data);
      
      const message = err.response?.data?.detail || 
                     err.response?.data?.message || 
                     'Unable to process password reset request. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mb-7 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Reset Password</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Forgot your password?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {success && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-900">Check your email</h3>
                    <p className="mt-1 text-sm text-emerald-700">
                      We've sent a password reset link to your email. The link will expire in 24 hours.
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
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Email Address</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-base font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 transition hover:text-primary-700"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>

            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-900">
                <strong>💡 Troubleshooting:</strong> If you don't see the email, check:
                <br />
                • Spam/Junk folder in your email
                <br />
                • <code className="bg-white px-1 py-0.5 rounded text-xs">sent_emails</code> folder in project (development)
                <br />
                • Open browser console (F12) for error messages
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
