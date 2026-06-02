import { maskSensitive } from './log-sanitizer';

describe('maskSensitive', () => {
  it('masks sensitive keys recursively', () => {
    const result = maskSensitive({
      password: 'secret',
      profile: {
        accessToken: 'token-123',
        authorization: 'Bearer abc',
        apiKey: 'key-123',
      },
      items: [{ refreshToken: 'refresh-123' }],
    });

    expect(result).toEqual({
      password: '[REDACTED]',
      profile: {
        accessToken: '[REDACTED]',
        authorization: '[REDACTED]',
        apiKey: '[REDACTED]',
      },
      items: [{ refreshToken: '[REDACTED]' }],
    });
  });

  it('masks emails and bearer-like values in plain strings', () => {
    expect(maskSensitive('user@example.com')).toBe('us**@example.com');
    expect(maskSensitive('Bearer token-abc')).toBe('[REDACTED]');
  });

  it('preserves safe data', () => {
    expect(maskSensitive({ action: 'CREATE', total: 2 })).toEqual({
      action: 'CREATE',
      total: 2,
    });
  });
});
