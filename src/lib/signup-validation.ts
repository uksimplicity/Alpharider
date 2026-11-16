export const signupPasswordCriteria = (password: string) => [
  { label: "At least 8 characters", met: password.length >= 8 },
  { label: "Includes a letter", met: /[A-Za-z]/.test(password) },
  { label: "Includes a number", met: /\d/.test(password) },
  { label: "Includes a special character", met: /[^A-Za-z0-9]/.test(password) },
];

export function signupValidationMessage(input: {
  name: string; email: string; phone: string; password: string;
  confirmPassword: string; userCategory: string; acceptedTerms: boolean;
}) {
  if (!input.name.trim()) return "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) return "Enter a valid email address.";
  if (!input.phone.trim()) return "Enter your phone number.";
  if (!["rider", "user"].includes(input.userCategory)) return "Select Rider or User under User Category.";
  if (!signupPasswordCriteria(input.password).every(item => item.met)) return "Your password must have at least 8 characters, including a letter, a number and a special character.";
  if (input.password !== input.confirmPassword) return "Your passwords do not match.";
  if (!input.acceptedTerms) return "Agree to the Terms & Conditions to continue.";
  return "";
}
