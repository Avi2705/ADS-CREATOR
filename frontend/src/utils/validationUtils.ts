/**
 * Strict Field-Level Validation Utilities for AD-HUNTER
 */

// 1. Strict Name Validator: Only letters (A-Z, a-z) and spaces allowed
export const sanitizeName = (value: string): string => {
  return value.replace(/[^a-zA-Z\s]/g, '');
};

export const validateName = (name: string): { isValid: boolean; error: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Full Name is required.' };
  }
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return { isValid: false, error: 'Name must contain only alphabetic characters and spaces.' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  return { isValid: true, error: '' };
};

// 2. Strict Phone Number Validator: Only numeric digits allowed
export const sanitizePhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const validatePhoneDigits = (phone: string, minLength = 8, maxLength = 11): { isValid: boolean; error: string } => {
  if (!phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  if (!/^\d+$/.test(phone.trim())) {
    return { isValid: false, error: 'Phone number must contain only numeric digits.' };
  }
  if (phone.trim().length < minLength || phone.trim().length > maxLength) {
    return { isValid: false, error: `Phone number must be between ${minLength} and ${maxLength} digits.` };
  }
  return { isValid: true, error: '' };
};

// 3. Strict Email Validator: Validates Local Part (before @) and Top Level Domain (TLD extension after dot)
export const validateEmail = (email: string): { isValid: boolean; error: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const parts = email.trim().split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email must contain exactly one "@" symbol.' };
  }

  const [localPart, domainPart] = parts;

  if (!localPart || localPart.length < 1) {
    return { isValid: false, error: 'Email local part (before @) cannot be empty.' };
  }

  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: false, error: 'Email domain must include a top-level domain (e.g. domain.com).' };
  }

  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return { isValid: false, error: 'Invalid top-level domain extension (e.g. .com, .in, .org).' };
  }

  // Complete strict email regex check
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, error: '' };
};
