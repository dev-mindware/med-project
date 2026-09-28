import { HttpException } from '@nestjs/common';

export function importKey(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value).trim().toLowerCase();
  }
  return JSON.stringify(value).trim().toLowerCase();
}

export function httpErrorToImportMessage(error: unknown): string {
  if (error instanceof HttpException) {
    const response = error.getResponse();

    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join('; ');
      if (message) return message;
    }
  }

  if (error instanceof Error) return error.message;
  return 'Erro desconhecido durante a importação';
}
