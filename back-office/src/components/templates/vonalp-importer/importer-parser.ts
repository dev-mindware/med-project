import * as XLSX from "xlsx";
import type {
  ImportColumn,
  ImportErrorRow,
  ImportOption,
  ImportPayloadRow,
  ImportWarningRow,
  VonalpImportConfig,
} from "./types";

export async function parseVonalpWorkbook(file: File, config: VonalpImportConfig) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      totalRows: 0,
      rows: [],
      errors: [{ rowNumber: 0, message: "O ficheiro nao contem folhas validas." }] as ImportErrorRow[],
      warnings: [] as ImportWarningRow[],
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const [headerRow, ...dataRows] = matrix;

  if (!headerRow || headerRow.length === 0) {
    return {
      totalRows: 0,
      rows: [],
      errors: [{ rowNumber: 1, message: "A primeira linha deve conter os cabecalhos do template." }],
      warnings: [] as ImportWarningRow[],
    };
  }

  const nonEmptyRows = dataRows.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
  if (nonEmptyRows.length > 1000) {
    return {
      totalRows: nonEmptyRows.length,
      rows: [],
      errors: [{ rowNumber: 0, message: "O ficheiro excede o limite de 1000 linhas de dados." }],
      warnings: [] as ImportWarningRow[],
    };
  }

  const headerIndexes = buildHeaderIndexes(headerRow, config);
  const missingHeaders = config.columns.filter((column) => column.required && !headerIndexes.has(column.key));
  if (missingHeaders.length > 0) {
    return {
      totalRows: nonEmptyRows.length,
      rows: [],
      errors: missingHeaders.map((column) => ({
        rowNumber: 1,
        field: column.label,
        message: `Coluna obrigatória do template ausente: ${headerLabel(column)}`,
      })),
      warnings: [] as ImportWarningRow[],
    };
  }

  const rows: ImportPayloadRow[] = [];
  const errors: ImportErrorRow[] = [];
  const warnings: ImportWarningRow[] = [];
  const seen = new Set<string>();

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!row.some((cell) => String(cell ?? "").trim() !== "")) return;

    const rowErrors: ImportErrorRow[] = [];
    const rowWarnings: ImportWarningRow[] = [];
    const data: Record<string, unknown> = {};

    config.columns.forEach((column) => {
      const columnIndex = headerIndexes.get(column.key);
      const rawValue = columnIndex === undefined ? "" : row[columnIndex];
      const parsed = parseCellValue(rawValue, column);

      if (parsed.error) {
        rowErrors.push({ rowNumber, field: column.label, value: rawValue, message: parsed.error });
        return;
      }

      if (column.required && isEmptyValue(parsed.value)) {
        rowErrors.push({ rowNumber, field: column.label, value: rawValue, message: "Campo obrigatório em falta." });
        return;
      }

      if (column.recommended && isEmptyValue(parsed.value)) {
        rowWarnings.push({
          rowNumber,
          field: column.label,
          message: `Campo recomendado em falta: ${column.label}.`,
        });
      }

      if (!isEmptyValue(parsed.value)) {
        data[column.key] = parsed.value;
      }
    });

    const primaryValue = data[config.primaryField];
    if (!isEmptyValue(primaryValue)) {
      const key = String(primaryValue).trim().toLowerCase();
      if (seen.has(key)) {
        rowErrors.push({
          rowNumber,
          field: fieldLabel(config, config.primaryField),
          value: primaryValue,
          message: "Vocábulo duplicado no ficheiro.",
        });
      }
      seen.add(key);
    }

    const validation = config.schema.safeParse(data);
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        rowErrors.push({
          rowNumber,
          field: fieldLabel(config, issue.path.join(".")),
          message: issue.message,
        });
      });
    }

    if (rowErrors.length > 0) {
      errors.push(...dedupeErrors(rowErrors));
    } else {
      warnings.push(...dedupeWarnings(rowWarnings));
      rows.push({ rowNumber, data: validation.data as Record<string, unknown> });
    }
  });

  return {
    totalRows: rows.length + countRowsWithErrors(errors),
    rows,
    errors,
    warnings,
  };
}

function buildHeaderIndexes(headerRow: unknown[], config: VonalpImportConfig) {
  const headers = headerRow.map(normalizeHeader);
  const indexByHeader = new Map<string, number>();
  headers.forEach((header, index) => indexByHeader.set(header, index));

  const headerIndexes = new Map<string, number>();
  config.columns.forEach((column) => {
    const candidates = [column.label, column.key, ...(column.aliases ?? [])].map(normalizeHeader);
    const match = candidates.find((candidate) => indexByHeader.has(candidate));
    if (match) headerIndexes.set(column.key, indexByHeader.get(match)!);
  });

  return headerIndexes;
}

function parseCellValue(rawValue: unknown, column: ImportColumn): { value?: unknown; error?: string } {
  const type = column.type || "text";

  if (type === "boolean") {
    if (isEmptyValue(rawValue)) return { value: undefined };
    const booleanValue = parseBoolean(rawValue);
    if (booleanValue === null) {
      return { error: "Valor booleano inválido. Use Sim, Não, true, false, 1 ou 0." };
    }
    return { value: booleanValue };
  }

  if (type === "array") {
    if (isEmptyValue(rawValue)) return { value: undefined };
    const values = String(rawValue)
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
    const resolved = resolveOptions(values, column.options);
    if (resolved.error) return { error: resolved.error };
    return { value: resolved.values };
  }

  const value = isEmptyValue(rawValue) ? undefined : String(rawValue).trim();
  if (value && column.options) {
    const option = resolveOption(value, column.options);
    if (!option) return { error: "Valor inválido. Use um dos valores definidos na folha Opções." };
    return { value: option.value };
  }

  return { value };
}

function parseBoolean(value: unknown) {
  const normalized = normalizeHeader(value);
  if (["sim", "s", "true", "1", "yes"].includes(normalized)) return true;
  if (["nao", "não", "n", "false", "0", "no"].includes(normalized)) return false;
  return null;
}

function resolveOptions(values: string[], options?: ImportOption[]) {
  if (!options || options.length === 0) return { values };

  const resolved: string[] = [];
  for (const value of values) {
    const option = resolveOption(value, options);
    if (!option) return { error: `Valor inválido: ${value}. Use valores da folha Opções.` };
    resolved.push(option.value);
  }

  return { values: resolved };
}

function resolveOption(value: string, options: ImportOption[]) {
  const normalized = normalizeHeader(value);
  return options.find(
    (option) => normalizeHeader(option.value) === normalized || normalizeHeader(option.label) === normalized
  );
}

function headerLabel(column: ImportColumn) {
  return `${column.label}${column.required ? "*" : ""}`;
}

function fieldLabel(config: VonalpImportConfig, key: string) {
  if (!key) return undefined;
  return config.columns.find((column) => column.key === key)?.label || key;
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\*$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isEmptyValue(value: unknown) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
}

function countRowsWithErrors(errors: ImportErrorRow[]) {
  return new Set(errors.map((error) => error.rowNumber)).size;
}

function dedupeErrors(errors: ImportErrorRow[]) {
  const seen = new Set<string>();
  return errors.filter((error) => {
    const key = `${error.rowNumber}:${error.field}:${error.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeWarnings(warnings: ImportWarningRow[]) {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.rowNumber}:${warning.field}:${warning.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
