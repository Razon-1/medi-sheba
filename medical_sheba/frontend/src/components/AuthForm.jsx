import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const roleOptions = [
  { value: 'patient', label: 'Patient' },
  { value: 'pharmacy_admin', label: 'Pharmacy Admin' },
  { value: 'hospital_admin', label: 'Hospital Admin' },
  { value: 'ambulance_driver_admin', label: 'Ambulance Driver Admin' },
];

const adminRoles = ['pharmacy_admin', 'hospital_admin', 'ambulance_driver_admin'];

export default function AuthForm({ type = 'login', onSubmit, loading = false }) {
  const isRegister = type === 'register';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roles: ['patient'],
  });

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleRole = (role) => {
    setFormData((current) => {
      const hasRole = current.roles.includes(role);
      let roles;

      if (role === 'patient') {
        roles = hasRole ? [] : ['patient'];
      } else {
        roles = hasRole
          ? current.roles.filter((item) => item !== role)
          : [...current.roles.filter((item) => item !== 'patient'), role];
        roles = roles.filter((item) => item === 'patient' || adminRoles.includes(item));
      }

      return {
        ...current,
        roles: roles.length ? roles : ['patient'],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isRegister && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-700">Full Name</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-700">Email Address</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
      </label>

      {!isRegister && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-700">Login Role</span>
          <select
            value={formData.roles[0] || 'patient'}
            onChange={(event) => updateField('roles', [event.target.value])}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            required
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {isRegister && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-gray-700">Phone Number</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              placeholder="+880 1700000000"
              autoComplete="tel"
              required
            />
          </div>
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-700">Password</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(event) => updateField('password', event.target.value)}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Enter password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
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

      {!isRegister && (
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      )}

      {isRegister && (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Confirm Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-12 text-base font-medium text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
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

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-gray-700">Account Type</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roleOptions.map((role) => {
                const checked = formData.roles.includes(role.value);
                return (
                  <label
                    key={role.value}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      checked
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={checked}
                      onChange={() => toggleRole(role.value)}
                    />
                    {role.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-base font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
      </button>
    </form>
  );
}
