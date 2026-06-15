import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { NotificationsService } from '../notifications/notifications.service';

type ReportFormat = 'xlsx' | 'pdf';

type ReportColumn = {
  header: string;
  key: string;
  width: number;
};

type ReportDefinition = {
  type: string;
  title: string;
  subtitle: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
};

type GeneratedReport = {
  buffer: Buffer;
  contentType: string;
  filename: string;
  format: ReportFormat;
};

const PRIMARY = '2563EB';
const PRIMARY_DARK = '1D4ED8';
const PRIMARY_SOFT = 'DBEAFE';
const BORDER = 'BFDBFE';
const TEXT = '1E293B';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async generateReport(type: string, userId?: string, format: ReportFormat = 'xlsx'): Promise<GeneratedReport> {
    const normalizedFormat = this.normalizeFormat(format);
    const report = await this.buildReportDefinition(type);
    const generatedAt = new Date();
    const filename = `${type}_report_${generatedAt.getTime()}.${normalizedFormat}`;
    const buffer = normalizedFormat === 'pdf'
      ? this.generatePdf(report, generatedAt)
      : await this.generateExcel(report, generatedAt);

    await this.prisma.report.create({
      data: {
        type,
        status: 'COMPLETED',
        filename,
        generatedById: userId,
        parameters: {
          format: normalizedFormat,
          title: report.title,
          totalRows: report.rows.length,
          generatedAt: generatedAt.toISOString(),
        },
      },
    });

    if (userId) {
      await this.notificationsService.create({
        userId,
        title: 'Relatório gerado',
        message: `O relatório "${report.title}" foi gerado em ${normalizedFormat.toUpperCase()}.`,
        type: 'REPORT_GENERATED',
        entity: 'Report',
        metadata: {
          format: normalizedFormat,
          filename,
          totalRows: report.rows.length,
        },
      });
    }

    return {
      buffer,
      filename,
      format: normalizedFormat,
      contentType: normalizedFormat === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private normalizeFormat(format?: string): ReportFormat {
    if (format === 'pdf') return 'pdf';
    return 'xlsx';
  }

  private async buildReportDefinition(type: string): Promise<ReportDefinition> {
    if (type === 'users') return this.buildUsersReport();
    if (type === 'activity') return this.buildActivityReport();
    if (type === 'summary') return this.buildSummaryReport();
    throw new NotFoundException('Tipo de relatório inválido');
  }

  private async buildUsersReport(): Promise<ReportDefinition> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

    return {
      type: 'users',
      title: 'Relatório de Utilizadores',
      subtitle: 'Lista operacional de utilizadores registados no sistema',
      columns: [
        { header: 'ID', key: 'id', width: 22 },
        { header: 'Nome', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 36 },
        { header: 'Função', key: 'role', width: 18 },
        { header: 'Estado', key: 'status', width: 16 },
        { header: 'Data de registo', key: 'createdAt', width: 24 },
      ],
      rows: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: this.translateRole(user.role),
        status: user.isActive ? 'Ativo' : 'Inativo',
        createdAt: this.formatDateTime(user.createdAt),
      })),
    };
  }

  private async buildActivityReport(): Promise<ReportDefinition> {
    const logs = await this.prisma.auditLog.findMany({
      take: 500,
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    });

    return {
      type: 'activity',
      title: 'Relatório de Actividade',
      subtitle: 'Últimas ações registadas no módulo de auditoria',
      columns: [
        { header: 'Data', key: 'createdAt', width: 24 },
        { header: 'Ator', key: 'actor', width: 30 },
        { header: 'Ação', key: 'action', width: 18 },
        { header: 'Entidade', key: 'entity', width: 22 },
        { header: 'ID da entidade', key: 'entityId', width: 22 },
        { header: 'Estado', key: 'status', width: 16 },
      ],
      rows: logs.map((log) => ({
        createdAt: this.formatDateTime(log.createdAt),
        actor: log.actor?.name || 'Sistema',
        action: this.translateAction(log.action),
        entity: this.translateEntity(log.entity),
        entityId: log.entityId || '-',
        status: this.translateStatus(log.status),
      })),
    };
  }

  private async buildSummaryReport(): Promise<ReportDefinition> {
    const [entries, neologisms, toponyms, anthroponyms, foreignisms, users] = await Promise.all([
      this.prisma.entry.count(),
      this.prisma.neologism.count(),
      this.prisma.toponym.count(),
      this.prisma.anthroponym.count(),
      this.prisma.foreignism.count(),
      this.prisma.user.count(),
    ]);

    return {
      type: 'summary',
      title: 'Resumo Geral de Métricas',
      subtitle: 'Indicadores principais do acervo linguístico e da operação',
      columns: [
        { header: 'Categoria', key: 'category', width: 36 },
        { header: 'Total', key: 'total', width: 18 },
      ],
      rows: [
        { category: 'Entradas do dicionário', total: entries },
        { category: 'Neologismos', total: neologisms },
        { category: 'Topónimos', total: toponyms },
        { category: 'Antropónimos', total: anthroponyms },
        { category: 'Estrangeirismos', total: foreignisms },
        { category: 'Utilizadores', total: users },
      ],
    };
  }

  private async generateExcel(report: ReportDefinition, generatedAt: Date): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Linguístico';
    workbook.company = 'MedProject';
    workbook.created = generatedAt;
    workbook.modified = generatedAt;
    workbook.properties.date1904 = false;

    const sheet = workbook.addWorksheet(report.title, {
      views: [{ state: 'frozen', ySplit: 6 }],
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    const lastColumn = report.columns.length;
    sheet.mergeCells(1, 1, 2, lastColumn);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = report.title;
    titleCell.fill = this.solidFill(PRIMARY);
    titleCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 18 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 28;
    sheet.getRow(2).height = 28;

    sheet.mergeCells(3, 1, 3, lastColumn);
    const subtitleCell = sheet.getCell(3, 1);
    subtitleCell.value = report.subtitle;
    subtitleCell.fill = this.solidFill(PRIMARY_DARK);
    subtitleCell.font = { color: { argb: 'FFFFFFFF' }, size: 11 };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.mergeCells(4, 1, 4, lastColumn);
    const metaCell = sheet.getCell(4, 1);
    metaCell.value = `Gerado em: ${this.formatDateTime(generatedAt)} | Total de registos: ${report.rows.length}`;
    metaCell.fill = this.solidFill(PRIMARY_SOFT);
    metaCell.font = { color: { argb: `FF${TEXT}` }, size: 10 };
    metaCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const headerRow = sheet.getRow(6);
    headerRow.height = 26;
    report.columns.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = column.header;
      cell.fill = this.solidFill(PRIMARY);
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = this.cellBorder();
      sheet.getColumn(index + 1).width = column.width;
    });

    report.rows.forEach((item, rowIndex) => {
      const row = sheet.addRow(report.columns.map((column) => item[column.key] ?? '-'));
      row.height = 22;
      row.eachCell((cell) => {
        cell.fill = this.solidFill(rowIndex % 2 === 0 ? 'EFF6FF' : 'FFFFFF');
        cell.font = { color: { argb: `FF${TEXT}` }, size: 10 };
        cell.border = this.cellBorder();
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    const footerRowIndex = report.rows.length + 8;
    sheet.mergeCells(footerRowIndex, 1, footerRowIndex, lastColumn);
    const footerCell = sheet.getCell(footerRowIndex, 1);
    footerCell.value = `MedProject | ${report.title} | ${report.rows.length} registos`;
    footerCell.fill = this.solidFill(PRIMARY);
    footerCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    footerCell.alignment = { horizontal: 'center' };

    sheet.autoFilter = {
      from: { row: 6, column: 1 },
      to: { row: 6, column: lastColumn },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private generatePdf(report: ReportDefinition, generatedAt: Date): Buffer {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 36;
    const headerHeight = 82;
    const rowHeight = 22;
    const tableTop = 142;
    const rowsPerPage = Math.max(1, Math.floor((pageHeight - tableTop - 58) / rowHeight));
    const pages: string[] = [];
    const columnWidths = this.getPdfColumnWidths(report.columns, pageWidth - margin * 2);

    for (let pageIndex = 0; pageIndex < Math.max(1, Math.ceil(report.rows.length / rowsPerPage)); pageIndex++) {
      const rows = report.rows.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
      pages.push(this.buildPdfPage({
        report,
        rows,
        pageIndex,
        pageCount: Math.max(1, Math.ceil(report.rows.length / rowsPerPage)),
        generatedAt,
        pageWidth,
        pageHeight,
        margin,
        headerHeight,
        tableTop,
        rowHeight,
        columnWidths,
      }));
    }

    return this.composePdf(pages, pageWidth, pageHeight);
  }

  private buildPdfPage(params: {
    report: ReportDefinition;
    rows: Record<string, any>[];
    pageIndex: number;
    pageCount: number;
    generatedAt: Date;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    headerHeight: number;
    tableTop: number;
    rowHeight: number;
    columnWidths: number[];
  }) {
    const { report, rows, pageIndex, pageCount, generatedAt, pageWidth, pageHeight, margin, headerHeight, tableTop, rowHeight, columnWidths } = params;
    const commands: string[] = [];
    const primary = this.hexToRgb(PRIMARY);
    const primaryDark = this.hexToRgb(PRIMARY_DARK);
    const primarySoft = this.hexToRgb('EFF6FF');
    const text = this.hexToRgb(TEXT);

    commands.push(`${primary.r} ${primary.g} ${primary.b} rg 0 ${pageHeight - headerHeight} ${pageWidth} ${headerHeight} re f`);
    commands.push(`${primaryDark.r} ${primaryDark.g} ${primaryDark.b} rg 0 ${pageHeight - headerHeight - 16} ${pageWidth} 16 re f`);
    commands.push(`BT /F1 18 Tf 1 1 1 rg ${margin} ${pageHeight - 44} Td (${this.pdfText(report.title)}) Tj ET`);
    commands.push(`BT /F1 10 Tf 1 1 1 rg ${margin} ${pageHeight - 64} Td (${this.pdfText(report.subtitle)}) Tj ET`);
    commands.push(`BT /F1 9 Tf 1 1 1 rg ${margin} ${pageHeight - 94} Td (${this.pdfText(`Gerado em ${this.formatDateTime(generatedAt)} | ${report.rows.length} registos`)}) Tj ET`);

    let x = margin;
    commands.push(`${primary.r} ${primary.g} ${primary.b} rg ${margin} ${pageHeight - tableTop} ${pageWidth - margin * 2} 24 re f`);
    report.columns.forEach((column, index) => {
      commands.push(`BT /F1 8 Tf 1 1 1 rg ${x + 6} ${pageHeight - tableTop + 8} Td (${this.pdfText(this.truncate(column.header, Math.floor(columnWidths[index] / 5)))}) Tj ET`);
      x += columnWidths[index];
    });

    rows.forEach((row, rowIndex) => {
      const y = pageHeight - tableTop - 24 - rowIndex * rowHeight;
      const fill = rowIndex % 2 === 0 ? primarySoft : { r: 1, g: 1, b: 1 };
      commands.push(`${fill.r} ${fill.g} ${fill.b} rg ${margin} ${y} ${pageWidth - margin * 2} ${rowHeight} re f`);
      x = margin;
      report.columns.forEach((column, colIndex) => {
        commands.push(`BT /F1 7.5 Tf ${text.r} ${text.g} ${text.b} rg ${x + 6} ${y + 8} Td (${this.pdfText(this.truncate(String(row[column.key] ?? '-'), Math.floor(columnWidths[colIndex] / 4.6)))}) Tj ET`);
        x += columnWidths[colIndex];
      });
    });

    commands.push(`BT /F1 8 Tf ${text.r} ${text.g} ${text.b} rg ${margin} 28 Td (${this.pdfText(`MedProject | Página ${pageIndex + 1} de ${pageCount}`)}) Tj ET`);
    return commands.join('\n');
  }

  private composePdf(pageContents: string[], pageWidth: number, pageHeight: number): Buffer {
    const objects: string[] = [];
    const addObject = (content: string) => {
      objects.push(content);
      return objects.length;
    };

    const catalogId = addObject('');
    const pagesId = addObject('');
    const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const pageIds: number[] = [];

    pageContents.forEach((content) => {
      const stream = Buffer.from(content, 'latin1');
      const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${content}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'latin1');
  }

  private getPdfColumnWidths(columns: ReportColumn[], totalWidth: number) {
    const total = columns.reduce((sum, column) => sum + column.width, 0);
    return columns.map((column) => (column.width / total) * totalWidth);
  }

  private solidFill(color: string): ExcelJS.Fill {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color}` } };
  }

  private cellBorder(): Partial<ExcelJS.Borders> {
    return {
      top: { style: 'thin', color: { argb: `FF${BORDER}` } },
      left: { style: 'thin', color: { argb: `FF${BORDER}` } },
      bottom: { style: 'thin', color: { argb: `FF${BORDER}` } },
      right: { style: 'thin', color: { argb: `FF${BORDER}` } },
    };
  }

  private hexToRgb(hex: string) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
    };
  }

  private pdfText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, (match) => `\\${match}`);
  }

  private truncate(value: string, max: number) {
    if (value.length <= max) return value;
    return `${value.slice(0, Math.max(0, max - 3))}...`;
  }

  private formatDateTime(date: Date) {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  private translateRole(role: string) {
    return { ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', OPERATOR: 'Operador' }[role] || role;
  }

  private translateAction(action: string) {
    return { CREATE: 'Criação', UPDATE: 'Atualização', DELETE: 'Exclusão', LOGIN: 'Login', OTHER: 'Outra ação' }[action] || action;
  }

  private translateEntity(entity: string) {
    return {
      Entry: 'Entrada',
      Neologism: 'Neologismo',
      Toponym: 'Topónimo',
      Anthroponym: 'Antropónimo',
      Foreignism: 'Estrangeirismo',
      BlogPost: 'Publicação',
      Event: 'Evento',
      EventRegistration: 'Inscrição em evento',
      User: 'Utilizador',
      Auth: 'Autenticação',
      MediaAsset: 'Mídia',
    }[entity] || entity;
  }

  private translateStatus(status: string) {
    return { SUCCESS: 'Sucesso', FAILED: 'Falhou', COMPLETED: 'Concluído' }[status] || status;
  }

  async getHistory(params: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return this.prisma.report.findMany({
      ...params,
      include: { generatedBy: { select: { name: true, email: true } } },
    });
  }
}
