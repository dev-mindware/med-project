import { HttpException } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export type BulkImportRow = {
  rowNumber: number;
  data: Record<string, unknown>;
};

export type BulkImportCreated = {
  rowNumber: number;
  id: string;
  label: string;
};

export type BulkImportError = {
  rowNumber: number;
  field?: string;
  value?: unknown;
  message: string;
};

export type BulkImportResult = {
  totalRows: number;
  successCount: number;
  errorCount: number;
  created: BulkImportCreated[];
  errors: BulkImportError[];
};

export async function validateBulkImportData<T extends object>(
  dto: ClassConstructor<T>,
  rawData: Record<string, unknown>,
  rowNumber: number,
) {
  const instance = plainToInstance(dto, normalizeImportData(rawData));
  const validationErrors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return {
    data: removeUndefined(instance) as T,
    errors: flattenValidationErrors(validationErrors, rowNumber),
  };
}

export function buildBulkImportResult(
  totalRows: number,
  created: BulkImportCreated[],
  errors: BulkImportError[],
): BulkImportResult {
  return {
    totalRows,
    successCount: created.length,
    errorCount: errors.length,
    created,
    errors,
  };
}

export function importKey(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

export function httpErrorToImportMessage(error: unknown) {
  if (error instanceof HttpException) {
    const response = error.getResponse();

    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message.join('; ');
      if (message) return message;
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return 'Nao foi possivel importar esta linha';
}

function normalizeImportData(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(normalizeImportData).filter((item) => item !== '');
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeImportData(item)]),
    );
  }

  return value;
}

function removeUndefined<T extends object>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function flattenValidationErrors(errors: ValidationError[], rowNumber: number): BulkImportError[] {
  return errors.flatMap((error) => {
    const current = Object.values(error.constraints ?? {}).map((message) => ({
      rowNumber,
      field: error.property,
      value: error.value,
      message,
    }));

    const children = flattenValidationErrors(error.children ?? [], rowNumber);
    return [...current, ...children];
  });
}
