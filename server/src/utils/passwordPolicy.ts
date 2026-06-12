export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string,
  role: string
): PasswordValidationResult => {
  const errors: string[] = [];

  if (role === "doctor") {
    if (password.length < 10)
      errors.push("Password must be at least 10 characters");
    if (!/[A-Z]/.test(password))
      errors.push("Must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Must contain at least one lowercase letter");
    if (!/[0-9]/.test(password))
      errors.push("Must contain at least one number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      errors.push("Must contain at least one special character");
    if (/(.)\1{2,}/.test(password))
      errors.push("Must not have 3 or more repeating characters");

  } else if (role === "admin") {
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))
      errors.push("Must contain at least one uppercase letter");
    if (!/[0-9]/.test(password))
      errors.push("Must contain at least one number");

  } else {
    // patient
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
  }

  return { valid: errors.length === 0, errors };
};