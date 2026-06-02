import { AppLogger } from './app-logger.service';

describe('AppLogger', () => {
  let logger: AppLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new AppLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes info logs as JSON with operational context', () => {
    logger.info('Created entry', {
      context: 'EntriesService',
      action: 'ENTRY_CREATED',
      requestId: 'req-1',
      userId: 'user-1',
      meta: { entry: 'kota' },
    });

    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload).toMatchObject({
      level: 'info',
      message: 'Created entry',
      context: 'EntriesService',
      action: 'ENTRY_CREATED',
      requestId: 'req-1',
      userId: 'user-1',
      meta: { entry: 'kota' },
    });
  });

  it('masks sensitive fields before writing logs', () => {
    logger.error('Failed login', {
      context: 'AuthService',
      action: 'LOGIN_FAILED',
      error: new Error('Bearer token-abc'),
      meta: {
        password: 'secret',
        email: 'user@example.com',
      },
    });

    const payload = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(payload.level).toBe('error');
    expect(payload.meta.password).toBe('[REDACTED]');
    expect(payload.meta.email).toBe('us**@example.com');
    expect(payload.error.message).toBe('[REDACTED]');
  });

  it('routes fatal logs to stderr', () => {
    logger.fatal('Database unavailable', { context: 'PrismaService' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
