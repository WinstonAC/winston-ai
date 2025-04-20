export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
}

export const validateField = (
  value: any,
  rules: ValidationRules,
  fieldName: string
): ValidationError | null => {
  if (rules.required && !value) {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }

  if (value) {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${rules.minLength} characters`
      };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: fieldName,
        message: `${fieldName} must be no more than ${rules.maxLength} characters`
      };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        field: fieldName,
        message: `${fieldName} format is invalid`
      };
    }

    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return {
        field: fieldName,
        message: 'Invalid email address'
      };
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return {
          field: fieldName,
          message: customError
        };
      }
    }
  }

  return null;
};

export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, ValidationRules>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.keys(rules).forEach((field) => {
    const error = validateField(values[field], rules[field], field);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/
  }
}; 