import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class MailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private readonly enabled: boolean;

  constructor(
    private configService: ConfigService,
    private logger: AppLogger,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    this.enabled = Boolean(apiKey);
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@localhost';

    if (this.enabled) {
      this.resend = new Resend(apiKey);
      return;
    }

    this.logger.warn('RESEND_API_KEY not configured; email delivery is disabled', {
      context: 'MailService',
      action: 'EMAIL_DISABLED',
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Skipped email send because Resend is not configured', {
        context: 'MailService',
        action: 'EMAIL_SKIPPED',
        meta: { to, subject },
      });
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send email', {
        context: 'MailService',
        action: 'EMAIL_SEND_FAILED',
        error,
        meta: {
          to,
          subject,
        },
      });
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = `
      <h1>Recuperação de Senha</h1>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}">Redefinir Senha</a>
      <p>Este link expira em 1 hora.</p>
    `;
    return this.sendEmail(to, 'Recuperação de Senha - Sistema Linguístico', html);
  }

  async sendEmailVerification(to: string, token: string) {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const html = `
      <h1>Verificação de Email</h1>
      <p>Clique no link abaixo para verificar seu email:</p>
      <a href="${verifyUrl}">Verificar Email</a>
    `;
    return this.sendEmail(to, 'Verificação de Email - Sistema Linguístico', html);
  }

  async sendUserInvitation(to: string, name: string) {
    const loginUrl = `${this.configService.get('FRONTEND_URL')}/login`;
    const html = `
      <h1>Bem-vindo, ${name}!</h1>
      <p>Você foi convidado para participar do Sistema Linguístico.</p>
      <p>Pode aceder ao sistema aqui: <a href="${loginUrl}">Login</a></p>
    `;
    return this.sendEmail(to, 'Convite para o Sistema Linguístico', html);
  }

  async sendContentApprovedEmail(to: string, contentType: string, title: string) {
    const html = `
      <h1>Conteúdo Aprovado!</h1>
      <p>O seu registo de <strong>${contentType}</strong> ("${title}") foi aprovado e já está disponível no sistema.</p>
    `;
    return this.sendEmail(to, 'Seu conteúdo foi aprovado!', html);
  }

  async sendContentRejectedEmail(to: string, contentType: string, title: string, reason: string) {
    const html = `
      <h1>Conteúdo Rejeitado</h1>
      <p>O seu registo de <strong>${contentType}</strong> ("${title}") foi rejeitado.</p>
      <p><strong>Motivo:</strong> ${reason}</p>
    `;
    return this.sendEmail(to, 'Seu conteúdo foi rejeitado', html);
  }

  async sendCorrectionRequestedEmail(to: string, contentType: string, title: string, notes: string) {
    const html = `
      <h1>Correção Solicitada</h1>
      <p>O seu registo de <strong>${contentType}</strong> ("${title}") precisa de correções antes de ser aprovado.</p>
      <p><strong>Notas:</strong> ${notes}</p>
    `;
    return this.sendEmail(to, 'Correção solicitada no seu conteúdo', html);
  }

  async sendEventInvitationPass(to: string, name: string, eventTitle: string, eventDate: string, location: string, passId: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h1 style="color: #2c3e50;">🎟️ Convite de Participação</h1>
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Sua inscrição para o evento <strong>${eventTitle}</strong> foi aprovada com sucesso.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #27ae60;">
          <p style="margin: 5px 0;">📅 <strong>Data:</strong> ${eventDate}</p>
          <p style="margin: 5px 0;">📍 <strong>Local:</strong> ${location}</p>
          <p style="margin: 5px 0;">🆔 <strong>Passe de Entrada:</strong> <span style="font-family: monospace; background: #eee; padding: 4px 8px; border-radius: 3px; font-weight: bold;">${passId}</span></p>
        </div>
        <p>Por favor, apresente este código de identificação ou este e-mail na recepção do evento.</p>
        <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipa do Sistema Linguístico</strong></p>
      </div>
    `;
    return this.sendEmail(to, `🎟️ Seu Passe de Entrada: ${eventTitle}`, html);
  }

  async sendEventRegistrationRejected(to: string, name: string, eventTitle: string, reason?: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h1 style="color: #c0392b;">Inscrição Não Aprovada</h1>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Infelizmente, sua inscrição para o evento <strong>${eventTitle}</strong> não pôde ser aprovada neste momento.</p>
        ${reason ? `<div style="background-color: #fff5f5; padding: 10px; border-radius: 5px; border: 1px solid #feb2b2; margin: 15px 0;"><p><strong>Motivo:</strong> ${reason}</p></div>` : ''}
        <p>Agradecemos o seu interesse e convidamos você a participar de futuros eventos.</p>
        <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipa do Sistema Linguístico</strong></p>
      </div>
    `;
    return this.sendEmail(to, `Atualização sobre sua inscrição: ${eventTitle}`, html);
  }
}
