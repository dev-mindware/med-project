import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockUser = {
  id: 'user-uuid-1',
  email: 'admin@med.com',
  name: 'Admin User',
  role: 'ADMIN',
  isActive: true,
  passwordHash: 'hashed_password',
};

const mockUsersService = {
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
  verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-uuid-1' }),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock-secret'),
};

const mockPrismaService = {
  refreshToken: {
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
    findMany: jest.fn().mockResolvedValue([{ tokenHash: 'hashed_rt' }]),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── VALIDATE USER ─────────────────────────────────────────────────────────
  describe('validateUser()', () => {
    it('should return user data (without passwordHash) on valid credentials', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      const result = await service.validateUser('admin@med.com', 'correct_pass');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('admin@med.com');
    });

    it('should return null on invalid password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      const result = await service.validateUser('admin@med.com', 'wrong_pass');
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      const result = await service.validateUser('ghost@med.com', 'pass');
      expect(result).toBeNull();
    });
  });

  // ─── REGISTER ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should hash password and create user', async () => {
      (argon2.hash as jest.Mock).mockResolvedValueOnce('new_hashed');
      mockUsersService.create.mockResolvedValueOnce(mockUser);
      const result = await service.register({
        email: 'new@med.com',
        name: 'New User',
        password: 'secure123',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(argon2.hash).toHaveBeenCalledWith('secure123');
    });

    it('should default role to OPERATOR when not provided', async () => {
      (argon2.hash as jest.Mock).mockResolvedValueOnce('hash');
      await service.register({ email: 'op@med.com', name: 'Op', password: 'pass' });
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'OPERATOR' }),
      );
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return access_token, refresh_token and user info', async () => {
      mockJwtService.signAsync.mockResolvedValue('signed.token');
      mockPrismaService.refreshToken.deleteMany.mockResolvedValueOnce({ count: 0 });
      mockPrismaService.refreshToken.create.mockResolvedValueOnce({});
      (argon2.hash as jest.Mock).mockResolvedValueOnce('hash');

      const result = await service.login(mockUser);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual(
        expect.objectContaining({ email: 'admin@med.com', role: 'ADMIN' }),
      );
    });

    it('should call jwtService.signAsync twice (access + refresh)', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hash');
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.refreshToken.create.mockResolvedValue({});
      await service.login(mockUser);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should delete all refresh tokens for the user', async () => {
      await service.logout('user-uuid-1');
      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
      });
    });
  });

  // ─── REFRESH TOKENS ────────────────────────────────────────────────────────
  describe('refreshTokens()', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'ghost-id' });
      mockUsersService.findById.mockResolvedValueOnce(null);
      await expect(service.refreshTokens('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('profile settings', () => {
    it('should update current user profile', async () => {
      await service.updateProfile('user-uuid-1', { name: 'Updated', profilePhotoUrl: 'https://avatar.test' });
      expect(mockUsersService.update).toHaveBeenCalledWith('user-uuid-1', {
        name: 'Updated',
        profilePhotoUrl: 'https://avatar.test',
      });
    });

    it('should reject an email already used by another user', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce({ ...mockUser, id: 'other-id' });
      await expect(service.updateEmail('user-uuid-1', 'admin@med.com')).rejects.toThrow();
    });

    it('should reject wrong current password', async () => {
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.updatePassword('user-uuid-1', {
        currentPassword: 'wrong',
        newPassword: 'new-pass',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should update password hash and lastPasswordChangeAt', async () => {
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      (argon2.hash as jest.Mock).mockResolvedValueOnce('new-hash');
      await service.updatePassword('user-uuid-1', {
        currentPassword: 'correct',
        newPassword: 'new-pass',
      });
      expect(mockUsersService.update).toHaveBeenCalledWith('user-uuid-1', expect.objectContaining({
        passwordHash: 'new-hash',
        lastPasswordChangeAt: expect.any(Date),
      }));
    });
  });
});
