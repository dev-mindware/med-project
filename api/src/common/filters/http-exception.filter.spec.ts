import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { AppLogger } from '../logger/app-logger.service';

describe('AllExceptionsFilter', () => {
  const logger = {
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as AppLogger;
  let filter: AllExceptionsFilter;
  let response: any;
  let request: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter(logger);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    request = {
      url: '/entries',
      method: 'POST',
      requestId: 'req-1',
      user: { id: 'user-1' },
      get: jest.fn().mockReturnValue('req-1'),
    };
    jest.clearAllMocks();
  });

  it('logs client errors as warn with request context', () => {
    filter.catch(new BadRequestException({ message: 'Invalid input', password: 'secret' }), host());

    expect(logger.warn).toHaveBeenCalledWith(
      'Request rejected',
      expect.objectContaining({
        action: 'HTTP_EXCEPTION',
        requestId: 'req-1',
        userId: 'user-1',
        method: 'POST',
        path: '/entries',
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        error: expect.objectContaining({ password: '[REDACTED]' }),
      }),
    );
  });

  it('logs server errors as error', () => {
    filter.catch(new Error('database down'), host());

    expect(logger.error).toHaveBeenCalledWith(
      'Request failed',
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });

  function host(): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;
  }
});
