import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: UserRole.OPERATOR,
};

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockUser]),
  count: jest.fn().mockResolvedValue(1),
  create: jest.fn().mockResolvedValue(mockUser),
  findById: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  remove: jest.fn().mockResolvedValue(mockUser),
  listManagedOperators: jest.fn().mockResolvedValue([mockUser]),
  assignOperatorsToSupervisor: jest.fn().mockResolvedValue({
    ...mockUser,
    role: UserRole.SUPERVISOR,
    managedOperators: [mockUser],
  }),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('should call service.findAll with pagination', async () => {
      const filters = { page: 1, limit: 10 } as any;
      await controller.findAll(filters, { id: 'admin-1', role: UserRole.ADMIN });
      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });
  });

  describe('create()', () => {
    it('should hash password if provided', async () => {
      const data = { email: 'test@test.com', password: 'plain-password' };
      await controller.create(data);
      expect(argon2.hash).toHaveBeenCalledWith('plain-password');
      expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: 'hashed-password' }));
    });
  });

  describe('updateRole()', () => {
    it('should call update with new role', async () => {
      await controller.updateRole('user-1', UserRole.ADMIN);
      expect(service.update).toHaveBeenCalledWith('user-1', { role: UserRole.ADMIN });
    });
  });

  describe('updateStatus()', () => {
    it('should call update with isActive value', async () => {
      await controller.updateStatus('user-1', true);
      expect(service.update).toHaveBeenCalledWith('user-1', { isActive: true });
    });
  });

  describe('listManagedOperators()', () => {
    it('should list operators managed by supervisor', async () => {
      await controller.listManagedOperators('supervisor-1');
      expect(service.listManagedOperators).toHaveBeenCalledWith('supervisor-1');
    });
  });

  describe('assignManagedOperators()', () => {
    it('should assign operators to supervisor', async () => {
      await controller.assignManagedOperators('supervisor-1', { operatorIds: ['operator-1'] });
      expect(service.assignOperatorsToSupervisor).toHaveBeenCalledWith('supervisor-1', ['operator-1']);
    });
  });
});
