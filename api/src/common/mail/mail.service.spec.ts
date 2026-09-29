import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/app-logger.service';

// Mock Resend at module level
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    },
  })),
}));

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      RESEND_API_KEY: 're_test_key',
      RESEND_FROM_EMAIL: 'noreply@med.com',
      FRONTEND_URL: 'https://app.med.com',
    };
    return config[key];
  }),
};

describe('MailService', () => {
  let service: MailService;
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  describe('sendEmail()', () => {
    it('should call Resend with correct parameters', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendPasswordResetEmail('user@test.com', 'reset-token-123');
      expect(spy).toHaveBeenCalledWith(
        'user@test.com',
        expect.stringContaining('Recuperação'),
        expect.stringContaining('reset-token-123'),
      );
    });
  });

  describe('sendPasswordResetEmail()', () => {
    it('should include the reset token in the email body', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendPasswordResetEmail('user@test.com', 'token-abc');
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('token-abc');
    });

    it('should use the FRONTEND_URL from config', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendPasswordResetEmail('user@test.com', 'mytoken');
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('https://app.med.com');
    });
  });

  describe('sendContentApprovedEmail()', () => {
    it('should include content type and title in the email', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendContentApprovedEmail(
        'op@med.com',
        'Entrada',
        'Mukanda',
      );
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('Entrada');
      expect(htmlArg).toContain('Mukanda');
    });
  });

  describe('sendContentRejectedEmail()', () => {
    it('should include rejection reason in the email', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendContentRejectedEmail(
        'op@med.com',
        'Topónimo',
        'Luanda',
        'Fonte inválida',
      );
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('Fonte inválida');
    });
  });

  describe('sendCorrectionRequestedEmail()', () => {
    it('should include correction notes in the email', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendCorrectionRequestedEmail(
        'op@med.com',
        'Entrada',
        'Soba',
        'Falta etimologia',
      );
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('Falta etimologia');
    });
  });

  describe('sendUserInvitation()', () => {
    it('should include user name in the invitation email', async () => {
      const spy = jest.spyOn(service as any, 'sendEmail');
      await service.sendUserInvitation('new@med.com', 'João Cardoso');
      const htmlArg = spy.mock.calls[0][2] as string;
      expect(htmlArg).toContain('João Cardoso');
    });
  });

  describe('when RESEND_API_KEY is missing', () => {
    it('should skip sending without throwing', async () => {
      const disabledConfig = {
        get: jest.fn((key: string) => {
          const config: Record<string, string | undefined> = {
            RESEND_API_KEY: '',
            RESEND_FROM_EMAIL: 'noreply@med.com',
            FRONTEND_URL: 'https://app.med.com',
          };
          return config[key];
        }),
      };

      const disabledLogger = {
        error: jest.fn(),
        warn: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          { provide: ConfigService, useValue: disabledConfig },
          { provide: AppLogger, useValue: disabledLogger },
        ],
      }).compile();

      const disabledService = module.get<MailService>(MailService);
      await expect(
        disabledService.sendPasswordResetEmail('user@test.com', 'token'),
      ).resolves.toBeUndefined();
      expect(disabledLogger.warn).toHaveBeenCalled();
    });
  });
});
