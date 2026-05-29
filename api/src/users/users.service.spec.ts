import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 'user-uuid-1',
  email: 'admin@med.com',
  name: 'Admin User',
  role: 'ADMIN',
  isActive: true,
  passwordHash: 'hashed_password',
  refreshTokenHash: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
    findMany: jest.fn().mockResolvedValue([mockUser]),
    findFirst: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(mockUser),
    count: jest.fn().mockResolvedValue(1),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('findByEmail()', () => {
    it('should return a user by email', async () => {
      const result = await service.findByEmail('admin@med.com');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@med.com' } });
    });

    it('should return null when email does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      const result = await service.findByEmail('ghost@med.com');
      expect(result).toBeNull();
    });
  });

  describe('findById()', () => {
    it('should return a user by id', async () => {
      const result = await service.findById('user-uuid-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-uuid-1' } });
    });

    it('should return null when id does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      expect(await service.findById('non-existent')).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll({ skip: 0, take: 10 });
      expect(result).toEqual([mockUser]);
      expect(prisma.user.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });

    it('should work without params', async () => {
      await service.findAll();
      expect(prisma.user.findMany).toHaveBeenCalledWith(undefined);
    });
  });

  describe('create()', () => {
    it('should create and return a user', async () => {
      const data = {
        email: 'new@med.com',
        name: 'New User',
        passwordHash: 'hashed',
        role: 'OPERATOR',
      } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('update()', () => {
    it('should update and return the user', async () => {
      const updated = { ...mockUser, name: 'Updated Name' };
      prisma.user.update.mockResolvedValueOnce(updated);
      const result = await service.update('user-uuid-1', { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { name: 'Updated Name' },
      });
    });
  });

  describe('remove()', () => {
    it('should delete and return the deleted user', async () => {
      const result = await service.remove('user-uuid-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-uuid-1' } });
    });
  });

  describe('assignOperatorsToSupervisor()', () => {
    it('should replace the managed operators list', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'supervisor-1', role: 'SUPERVISOR' });
      prisma.user.findMany.mockResolvedValueOnce([{ id: 'operator-1', role: 'OPERATOR' }]);

      await service.assignOperatorsToSupervisor('supervisor-1', ['operator-1']);

      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'supervisor-1' },
        data: { managedOperators: { set: [{ id: 'operator-1' }] } },
      }));
    });
  });

  describe('isOperatorManagedBySupervisor()', () => {
    it('should return true when operator belongs to supervisor', async () => {
      prisma.user.findFirst.mockResolvedValueOnce({ id: 'operator-1' });

      await expect(service.isOperatorManagedBySupervisor('supervisor-1', 'operator-1')).resolves.toBe(true);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'operator-1',
          role: 'OPERATOR',
          supervisorId: 'supervisor-1',
        },
        select: { id: true },
      });
    });
  });
});
