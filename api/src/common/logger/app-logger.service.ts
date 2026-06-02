import { Injectable } from '@nestjs/common';
import { maskSensitive } from './log-sanitizer';

export type AppLogLevel = 'info' | 'warn' | 'error' | 'fatal' | 'debug';

export type AppLogPayload = {
  context?: string;
  action?: string;
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  error?: unknown;
  meta?: Record<string, unknown>;
};

@Injectable()
export class AppLogger {
  info(message: string, payload: AppLogPayload = {}) {
    this.write('info', message, payload);
  }

  warn(message: string, payload: AppLogPayload = {}) {
    this.write('warn', message, payload);
  }

  error(message: string, payload: AppLogPayload = {}) {
    this.write('error', message, payload);
  }

  fatal(message: string, payload: AppLogPayload = {}) {
    this.write('fatal', message, payload);
  }

  debug(message: string, payload: AppLogPayload = {}) {
    if (process.env.NODE_ENV === 'production') return;
    this.write('debug', message, payload);
  }

  private write(level: AppLogLevel, message: string, payload: AppLogPayload) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: payload.context,
      action: payload.action,
      requestId: payload.requestId,
      userId: payload.userId,
      method: payload.method,
      path: payload.path,
      statusCode: payload.statusCode,
      durationMs: payload.durationMs,
      error: payload.error ? maskSensitive(payload.error) : undefined,
      meta: payload.meta ? maskSensitive(payload.meta) : undefined,
    };

    const serialized = JSON.stringify(removeUndefined(entry));
    if (level === 'error' || level === 'fatal') {
      console.error(serialized);
      return;
    }

    console.log(serialized);
  }
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}
