import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest
    .fn()
    .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }),
  register: jest
    .fn()
    .mockResolvedValue({ id: 'user-1', email: 'test@test.com' }),
  refreshTokens: jest.fn().mockResolvedValue({ accessToken: 'new-access' }),
  logout: jest.fn().mockResolvedValue({ success: true }),
  getProfile: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Test' }),
  updateProfile: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Updated' }),
  updateEmail: jest
    .fn()
    .mockResolvedValue({ id: 'user-1', email: 'new@test.com' }),
  updatePassword: jest.fn().mockResolvedValue({ id: 'user-1' }),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should call authService.login with req.user', async () => {
      const req = { user: { id: 'user-1', email: 'test@test.com' } };
      const result = await controller.login(req as any);
      expect(result).toHaveProperty('accessToken');
      expect(service.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('register()', () => {
    it('should call authService.register', async () => {
      const body = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test',
      };
      await controller.register(body);
      expect(service.register).toHaveBeenCalledWith(body);
    });
  });

  describe('refresh()', () => {
    it('should call authService.refreshTokens', async () => {
      await controller.refresh({ refreshToken: 'refresh-token' });
      expect(service.refreshTokens).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('logout()', () => {
    it('should call authService.logout with user id', async () => {
      const req = { user: { id: 'user-1' } };
      await controller.logout(req as any);
      expect(service.logout).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      const req = { user: { id: 'user-1', name: 'Test' } };
      await expect(controller.getProfile(req as any)).resolves.toEqual(
        req.user,
      );
      expect(service.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('settings mutations', () => {
    it('should update profile', async () => {
      const req = { user: { id: 'user-1' } };
      const body = { name: 'Updated' };
      await controller.updateProfile(req as any, body);
      expect(service.updateProfile).toHaveBeenCalledWith('user-1', body);
    });

    it('should update email', async () => {
      const req = { user: { id: 'user-1' } };
      await controller.updateEmail(req as any, 'new@test.com');
      expect(service.updateEmail).toHaveBeenCalledWith(
        'user-1',
        'new@test.com',
      );
    });

    it('should update password', async () => {
      const req = { user: { id: 'user-1' } };
      const body = { currentPassword: 'old', newPassword: 'new' };
      await controller.updatePassword(req as any, body);
      expect(service.updatePassword).toHaveBeenCalledWith('user-1', body);
    });
  });
});
