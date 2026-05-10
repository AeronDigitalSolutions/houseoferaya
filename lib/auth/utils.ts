export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function parseContactPayload(input: { email?: string; phone?: string }) {
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";

  return {
    email: email || undefined,
    phone: phone || undefined
  };
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value: string) {
  return /^[+]?[0-9]{8,15}$/.test(value);
}

