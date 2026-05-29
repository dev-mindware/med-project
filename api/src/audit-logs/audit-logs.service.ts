import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AuditLog } from '@prisma/client';

type AuditReportPeriod = 'daily' | 'monthly' | 'annual';

type AuditReportResult = {
  buffer: Buffer;
  filename: string;
  contentType: 'application/pdf';
};

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithRelationInput;
  }): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      ...params,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: params.orderBy || { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async generatePdfReport(period: AuditReportPeriod = 'daily', referenceDate = new Date()): Promise<AuditReportResult> {
    const { start, end, label } = this.getPeriodRange(period, referenceDate);
    const logs = await this.prisma.auditLog.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const title = `Relatorio de Auditoria - ${label}`;
    const lines = [
      title,
      `Periodo: ${this.formatDate(start)} a ${this.formatDate(end)}`,
      `Total de acoes registadas: ${logs.length}`,
      '',
      ...logs.flatMap((log, index) => [
        `${index + 1}. ${this.formatDateTime(log.createdAt)} | ${log.actor?.name || 'Sistema'} | ${this.translateAction(log.action)} | ${this.translateEntity(log.entity)}`,
        `   Entidade: ${log.entityId || '-'} | Estado: ${this.translateStatus(log.status)}`,
        `   Descricao: ${this.buildDescription(log)}`,
        '',
      ]),
    ];

    return {
      buffer: this.buildSimplePdf(lines),
      filename: `audit_logs_${period}_${referenceDate.getTime()}.pdf`,
      contentType: 'application/pdf',
    };
  }

  private getPeriodRange(period: AuditReportPeriod, referenceDate: Date) {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);

    if (period === 'annual') {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: String(referenceDate.getFullYear()) };
    }

    if (period === 'monthly') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: this.formatMonth(referenceDate) };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: this.formatDate(referenceDate) };
  }

  private buildSimplePdf(lines: string[]) {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 42;
    const lineHeight = 14;
    const usableLines = 34;
    const pages: string[] = [];

    for (let i = 0; i < Math.max(lines.length, 1); i += usableLines) {
      const pageLines = lines.slice(i, i + usableLines);
      const commands: string[] = [];
      commands.push('0.145 0.388 0.922 rg 0 535 842 60 re f');
      commands.push(`BT /F1 16 Tf 1 1 1 rg ${margin} 558 Td (${this.pdfText(pageLines[0] || 'Relatorio de Auditoria')}) Tj ET`);
      pageLines.slice(i === 0 ? 1 : 0).forEach((line, index) => {
        const y = 510 - index * lineHeight;
        commands.push(`BT /F1 9 Tf 0.12 0.16 0.23 rg ${margin} ${y} Td (${this.pdfText(this.truncate(line, 145))}) Tj ET`);
      });
      commands.push(`BT /F1 8 Tf 0.45 0.50 0.58 rg ${margin} 28 Td (${this.pdfText(`MedProject | Pagina ${pages.length + 1}`)}) Tj ET`);
      pages.push(commands.join('\n'));
    }

    return this.composePdf(pages, pageWidth, pageHeight);
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

  private buildDescription(log: any) {
    const actor = log.actor?.name || 'Sistema';
    return `${actor} executou ${this.translateAction(log.action).toLowerCase()} em ${this.translateEntity(log.entity)}.`;
  }

  private pdfText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()\\]/g, (match) => `\\${match}`);
  }

  private truncate(value: string, max: number) {
    return value.length <= max ? value : `${value.slice(0, max - 3)}...`;
  }

  private formatDateTime(date: Date) {
    return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short' }).format(date);
  }

  private formatMonth(date: Date) {
    return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(date);
  }

  private translateAction(action: string) {
    return { CREATE: 'Criacao', UPDATE: 'Atualizacao', DELETE: 'Exclusao', LOGIN: 'Login', OTHER: 'Outra acao' }[action] || action;
  }

  private translateEntity(entity: string) {
    return {
      Entry: 'Entrada',
      Toponym: 'Toponimo',
      Anthroponym: 'Antroponimo',
      Foreignism: 'Estrangeirismo',
      Event: 'Evento',
      User: 'Utilizador',
      Auth: 'Autenticacao',
      MediaAsset: 'Midia',
    }[entity] || entity;
  }

  private translateStatus(status: string) {
    return { SUCCESS: 'Sucesso', FAILED: 'Falhou', COMPLETED: 'Concluido' }[status] || status;
  }
}
