import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import useAuthStore from '../context/authStore';
import { useSEO, pageMetadata } from '../utils/seo';

export default function Register() {
  useSEO(pageMetadata.register);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const getRegistrationError = (err) => {
    const data = err.response?.data;

    if (!data) {
      return 'Registration failed. Please try again.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.message) {
      return data.message;
    }

    const messages = Object.entries(data)
      .map(([field, value]) => {
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        return `${field.replaceAll('_', ' ')}: ${text}`;
      })
      .filter(Boolean);

    return messages.length ? messages.join(' | ') : 'Registration failed. Please try again.';
  };

  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        roles: formData.roles || ['patient'],
      };

      await register(payload);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getRegistrationError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-2xl items-center">
        <div className="w-full overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-xl shadow-slate-900/10">
          <section className="px-5 py-7 sm:px-8 sm:py-9 lg:p-10">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-7 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Registration</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Set up your profile</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Choose the account type that matches how you will use Medi Sheba.
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

              <AuthForm type="register" onSubmit={handleRegister} loading={loading} />

              <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <p>Already have an account?</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-bold text-primary-600 transition hover:text-primary-700"
                >
                  <ArrowLeft size={16} />
                  Sign in here
                </Link>
              </div>

              <p className="mt-6 text-xs leading-6 text-gray-500">
                By registering, you agree to our{' '}
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
