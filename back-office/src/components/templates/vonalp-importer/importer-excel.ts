import ExcelJS from "exceljs";
import type { ImportErrorRow, ImportFinalReport, ImportWarningRow, VonalpImportConfig } from "./types";

const PRIMARY = "2563EB";
const PRIMARY_DARK = "1E40AF";
const WARNING = "D97706";
const DANGER = "DC2626";
const BORDER = "CBD5E1";

export async function downloadImportTemplate(config: VonalpImportConfig) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MedProject";
  workbook.created = new Date();

  const data = workbook.addWorksheet("Dados", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const instructions = workbook.addWorksheet("Instruções");
  const options = workbook.addWorksheet("Opções");

  const headers = config.columns.map((column) => `${column.label}${column.required ? "*" : ""}`);
  data.addRow(headers);
  data.addRow(config.columns.map((column) => column.example || ""));

  data.getRow(1).eachCell((cell, columnNumber) => {
    const column = config.columns[columnNumber - 1];
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${column?.recommended ? WARNING : PRIMARY}` },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = thinBorder();
  });
  data.getRow(1).height = 30;
  data.getRow(2).eachCell((cell) => {
    cell.font = { color: { argb: "FF64748B" }, italic: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    cell.border = thinBorder();
  });
  data.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };
  data.columns = config.columns.map((column) => ({
    key: column.key,
    width: Math.max(18, column.label.length + 6),
  }));

  instructions.columns = [{ width: 32 }, { width: 96 }];
  addTitle(instructions, `Template de ${config.title}`);
  addInstruction(instructions, "Campos obrigatórios", "Colunas marcadas com * precisam estar preenchidas; linhas sem esses campos não serão importadas.");
  addInstruction(instructions, "Campos recomendados", "Cabeçalhos em laranja indicam campos importantes para qualidade editorial; se estiverem vazios, a linha ainda pode ser importada, mas o relatório mostrará alerta.");
  addInstruction(instructions, "Booleanos", "Use Sim, Não, true, false, 1 ou 0.");
  addInstruction(instructions, "Listas", "Em campos de lista, separe múltiplos valores por ponto e vírgula (;).");
  addInstruction(instructions, "Compatibilidade", "Ficheiros antigos com nomes técnicos como entry ou firstDefinition continuam aceites.");
  addInstruction(instructions, "Limite", "O importador aceita até 1000 linhas por ficheiro e ficheiros até 5MB.");

  options.columns = [{ width: 32 }, { width: 32 }, { width: 56 }];
  options.addRow(["Grupo", "Valor aceite", "Label"]);
  options.getRow(1).eachCell((cell) => {
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${PRIMARY_DARK}` } };
    cell.border = thinBorder();
  });

  config.optionGroups?.forEach((group) => {
    group.options.forEach((option) => {
      const row = options.addRow([group.title, option.value, option.label]);
      row.eachCell((cell) => {
        cell.border = thinBorder();
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });
  });

  await downloadWorkbook(workbook, `${config.filenamePrefix}.xlsx`);
}

export async function downloadImportReport(config: VonalpImportConfig, report: ImportFinalReport) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MedProject";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Resumo");
  summary.columns = [{ width: 34 }, { width: 20 }];
  addTitle(summary, `Relatório de importação - ${config.title}`);
  [
    ["Linhas lidas", report.totalRows],
    ["Linhas validas", report.validRows],
    ["Linhas invalidas antes do envio", report.invalidRows],
    ["Importadas com sucesso", report.successCount],
    ["Erros bloqueantes", report.errorCount],
    ["Alertas de qualidade", report.warningCount],
    ["Gerado em", new Date().toLocaleString("pt-AO")],
  ].forEach(([label, value]) => {
    const row = summary.addRow([label, value]);
    row.eachCell((cell, index) => {
      cell.border = thinBorder();
      if (index === 1) cell.font = { bold: true };
    });
  });

  const imported = workbook.addWorksheet("Importados");
  imported.columns = [
    { header: "Linha", key: "rowNumber", width: 12 },
    { header: "ID", key: "id", width: 42 },
    { header: "Vocábulo", key: "label", width: 38 },
  ];
  styleHeader(imported);
  report.created.forEach((row) => imported.addRow(row));
  styleBody(imported);

  const warnings = workbook.addWorksheet("Alertas");
  warnings.columns = [
    { header: "Linha", key: "rowNumber", width: 12 },
    { header: "Campo", key: "field", width: 28 },
    { header: "Mensagem", key: "message", width: 82 },
  ];
  styleHeader(warnings, WARNING);
  report.warnings.forEach((row: ImportWarningRow) =>
    warnings.addRow({
      rowNumber: row.rowNumber,
      field: row.field || "",
      message: row.message,
    })
  );
  styleBody(warnings);

  const errors = workbook.addWorksheet("Erros");
  errors.columns = [
    { header: "Linha", key: "rowNumber", width: 12 },
    { header: "Campo", key: "field", width: 24 },
    { header: "Valor", key: "value", width: 32 },
    { header: "Mensagem", key: "message", width: 76 },
  ];
  styleHeader(errors, DANGER);
  report.errors.forEach((row: ImportErrorRow) =>
    errors.addRow({
      rowNumber: row.rowNumber,
      field: row.field || "",
      value: formatCellValue(row.value),
      message: row.message,
    })
  );
  styleBody(errors);

  await downloadWorkbook(workbook, `relatorio-importacao-${config.kind}-${Date.now()}.xlsx`);
}

function addTitle(sheet: ExcelJS.Worksheet, title: string) {
  const row = sheet.addRow([title]);
  row.height = 30;
  row.getCell(1).font = { bold: true, size: 16, color: { argb: `FF${PRIMARY}` } };
  sheet.addRow([]);
}

function addInstruction(sheet: ExcelJS.Worksheet, title: string, description: string) {
  const row = sheet.addRow([title, description]);
  row.eachCell((cell, index) => {
    cell.border = thinBorder();
    cell.alignment = { vertical: "middle", wrapText: true };
    if (index === 1) cell.font = { bold: true, color: { argb: `FF${PRIMARY_DARK}` } };
  });
}

function styleHeader(sheet: ExcelJS.Worksheet, color = PRIMARY) {
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${color}` } };
    cell.border = thinBorder();
  });
}

function styleBody(sheet: ExcelJS.Worksheet) {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = thinBorder();
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin", color: { argb: `FF${BORDER}` } },
    left: { style: "thin", color: { argb: `FF${BORDER}` } },
    bottom: { style: "thin", color: { argb: `FF${BORDER}` } },
    right: { style: "thin", color: { argb: `FF${BORDER}` } },
  };
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function formatCellValue(value: unknown) {
  if (Array.isArray(value)) return value.join("; ");
  if (value === null || value === undefined) return "";
  return String(value);
}
