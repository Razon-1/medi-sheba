import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';

export default function AuthForm({ type = 'login', onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    roles: ['patient'],
  });
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: '👤', color: 'blue' },
    { value: 'pharmacy_admin', label: 'Pharmacy Admin', icon: '💊', color: 'green' },
    { value: 'hospital_admin', label: 'Hospital Admin', icon: '🏥', color: 'purple' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      if (currentRoles.includes(roleValue)) {
        return {
          ...prev,
          roles: currentRoles.filter(r => r !== roleValue)
        };
      } else {
        return {
          ...prev,
          roles: [...currentRoles, roleValue]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {type === 'register' && (
        <>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={18} className="inline mr-2 text-primary-600" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="form-input"
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone size={18} className="inline mr-2 text-primary-600" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+880 1234567890"
              className="form-input"
            />
          </div>

          {/* User Type Selection */}
          <div className="form-group">
            <label className="form-label mb-4">
              <CheckCircle2 size={18} className="inline mr-2 text-primary-600" />
              User Type(s) - Select one or more
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleRoleChange(option.value)}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    (formData.roles || []).includes(option.value)
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`role-${option.value}`}
                      checked={(formData.roles || []).includes(option.value)}
                      onChange={() => {}}
                      className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                    />
                    <div className="text-2xl">{option.icon}</div>
                    <label 
                      htmlFor={`role-${option.value}`} 
                      className="font-medium text-gray-700 cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Email Address */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          <Mail size={18} className="inline mr-2 text-primary-600" />
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your@email.com"
          className="form-input"
        />
      </div>

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          <Lock size={18} className="inline mr-2 text-primary-600" />
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="form-input pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Confirm Password (Register Only) */}
      {type === 'register' && (
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            <Lock size={18} className="inline mr-2 text-primary-600" />
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="form-input"
          />
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary w-full py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Processing...
          </span>
        ) : type === 'login' ? (
          'Login to Account'
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
