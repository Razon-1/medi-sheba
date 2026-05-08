import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/components/AuthForm.css';

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
    { value: 'patient', label: 'Patient' },
    { value: 'pharmacy_admin', label: 'Pharmacy Admin' },
    { value: 'hospital_admin', label: 'Hospital Admin' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      if (currentRoles.includes(roleValue)) {
        // Remove role if it exists
        return {
          ...prev,
          roles: currentRoles.filter(r => r !== roleValue)
        };
      } else {
        // Add role if it doesn't exist
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
    <form className="auth-form" onSubmit={handleSubmit}>
      {type === 'register' && (
        <>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>User Type(s) - Select one or more</label>
            <div className="roles-container">
              {roleOptions.map(option => (
                <div key={option.value} className="role-checkbox">
                  <input
                    type="checkbox"
                    id={`role-${option.value}`}
                    name={option.value}
                    checked={(formData.roles || []).includes(option.value)}
                    onChange={() => handleRoleChange(option.value)}
                  />
                  <label htmlFor={`role-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {type === 'register' && (
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
        </div>
      )}

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Processing...' : type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
}
