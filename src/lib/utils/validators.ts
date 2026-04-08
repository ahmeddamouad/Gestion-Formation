import { FormErrors, RegistrationFormData } from "@/types";
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from "@/lib/constants";

// Validate email format
export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return ERROR_MESSAGES.required;
  }
  if (!VALIDATION_PATTERNS.email.test(email)) {
    return ERROR_MESSAGES.invalidEmail;
  }
  return undefined;
}

// Validate phone number (Moroccan format)
export function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) {
    return ERROR_MESSAGES.required;
  }
  // Allow more flexible phone formats
  const cleanPhone = phone.replace(/[\s.-]/g, "");
  if (!/^(\+212|0)[5-7][0-9]{8}$/.test(cleanPhone)) {
    return ERROR_MESSAGES.invalidPhone;
  }
  return undefined;
}

// Validate name (first or last)
export function validateName(name: string): string | undefined {
  if (!name.trim()) {
    return ERROR_MESSAGES.required;
  }
  if (!VALIDATION_PATTERNS.name.test(name.trim())) {
    return ERROR_MESSAGES.invalidName;
  }
  return undefined;
}

// Validate entire registration form
export function validateRegistrationForm(
  data: Partial<RegistrationFormData>
): FormErrors {
  const errors: FormErrors = {};

  const prenomError = validateName(data.prenom || "");
  if (prenomError) errors.prenom = prenomError;

  const nomError = validateName(data.nom || "");
  if (nomError) errors.nom = nomError;

  const emailError = validateEmail(data.email || "");
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.telephone || "");
  if (phoneError) errors.telephone = phoneError;

  // Entreprise is optional, no validation needed

  if (!data.mode) {
    errors.mode = ERROR_MESSAGES.required;
  }

  return errors;
}

// Check if form has errors
export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Clean phone number for storage
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s.-]/g, "");
}
