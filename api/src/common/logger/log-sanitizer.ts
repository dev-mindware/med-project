const MASK = '[REDACTED]';

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /api[-_]?key/i,
  /credential/i,
  /hash/i,
  /otp/i,
  /pin/i,
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEARER_PATTERN = /^bearer\s+.+/i;
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function isSensitiveKey(key: string) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function maskSensitive(value: unknown, parentKey = ''): unknown {
  if (parentKey && isSensitiveKey(parentKey)) return MASK;
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (EMAIL_PATTERN.test(trimmed)) return maskEmail(trimmed);
    if (BEARER_PATTERN.test(trimmed) || JWT_PATTERN.test(trimmed)) return MASK;
    return value;
  }

  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((item) => maskSensitive(item, parentKey));
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: maskSensitive(value.message),
      stack: maskSensitive(value.stack),
    };
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      maskSensitive(val, key),
    ]),
  );
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}
