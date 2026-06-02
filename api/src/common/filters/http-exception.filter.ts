import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app-logger.service';
import { maskSensitive } from '../logger/log-sanitizer';
import { RequestWithContext } from '../middleware/request-context.middleware';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };
    const requestId = request.requestId || request.get('x-request-id');
    const logPayload = {
      context: 'AllExceptionsFilter',
      action: 'HTTP_EXCEPTION',
      requestId,
      userId: request.user?.id,
      method: request.method,
      path: request.url,
      statusCode: status,
      error: exception,
      meta: { response: message },
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error('Request failed', logPayload);
    } else {
      this.logger.warn('Request rejected', logPayload);
    }

    response.status(status).json({
      statusCode: status,
      message: this.extractMessage(message),
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      error: maskSensitive(message),
    });
  }

  private extractMessage(payload: unknown) {
    if (typeof payload === 'string') return payload;
    if (payload && typeof payload === 'object') {
      const message = (payload as Record<string, any>).message;
      if (Array.isArray(message)) return message.join(', ');
      if (message) return message;
    }
    return 'Internal server error';
  }
}
