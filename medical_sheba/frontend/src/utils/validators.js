/**
 * Validation utilities for form fields
 */

// Bangladesh phone number validation
// Accepts formats: 01712345678, +8801712345678, +88 01712345678, etc.
export const validateBangladeshPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
  const normalized = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(normalized);
};

// Gmail address validation
export const validateGmailAddress = (email) => {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith('@gmail.com');
};

// Generic email validation
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Person name validation
// Accepts letters, spaces, periods, apostrophes, and hyphens
export const validatePersonName = (name) => {
  if (!name) return false;
  const nameRegex = /^[A-Za-z][A-Za-z .'-]*$/;
  return nameRegex.test(name.trim());
};

// Place name validation
export const validatePlaceName = (place) => {
  if (!place) return true; // Optional field
  const placeRegex = /^[A-Za-z][A-Za-z .'-]*$/;
  return placeRegex.test(place.trim());
};

// Password strength validation
export const validateStrongPassword = (password) => {
  if (!password) return false;
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must include at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim() !== '';
};

// Number range validation
export const validateNumberRange = (value, min, max) => {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};
