import { Test, TestingModule } from '@nestjs/testing';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { UserRole, ApprovalStatus } from '@prisma/client';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

const mockEntry = {
  id: 'entry-1',
  entry: 'Mukanda',
  firstDefinition: 'Carta',
  approvalStatus: ApprovalStatus.DRAFT,
  createdById: 'user-op-1',
};

const mockEntriesService = {
  create: jest.fn().mockResolvedValue(mockEntry),
  findAll: jest.fn().mockResolvedValue([mockEntry]),
  findOne: jest.fn().mockResolvedValue(mockEntry),
  update: jest.fn().mockResolvedValue(mockEntry),
  remove: jest.fn().mockResolvedValue(mockEntry),
  search: jest.fn().mockResolvedValue([mockEntry]),
};

describe('EntriesController', () => {
  let controller: EntriesController;
  let service: typeof mockEntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntriesController],
      providers: [
        { provide: EntriesService, useValue: mockEntriesService },
      ],
    }).compile();

    controller = module.get<EntriesController>(EntriesController);
    service = module.get(EntriesService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call service.create with user id and draft status', async () => {
      const req = { user: { id: 'user-1' } };
      const dto = { entry: 'Mukanda', firstDefinition: 'Carta' } as any;
      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: 'Mukanda',
          createdBy: { connect: { id: 'user-1' } },
          approvalStatus: ApprovalStatus.DRAFT,
        }),
      );
    });
  });

  describe('findAll()', () => {
    it('should call search if query is provided', async () => {
      const filters = { search: 'test', page: 1, limit: 10 } as any;
      await controller.findAll(filters);
      expect(service.search).toHaveBeenCalledWith('test', expect.any(Object));
    });

    it('should call findAll if no search query', async () => {
      const filters = { page: 1, limit: 10 } as any;
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return an entry if found', async () => {
      const result = await controller.findOne('entry-1');
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if not found', async () => {
      service.findOne.mockResolvedValueOnce(null);
      await expect(controller.findOne('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should throw ForbiddenException if Operator tries to edit someone else content', async () => {
      const req = { user: { id: 'user-op-2', role: UserRole.OPERATOR } };
      await expect(controller.update('entry-1', req, {} as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if Operator tries to edit approved content', async () => {
      const req = { user: { id: 'user-op-1', role: UserRole.OPERATOR } };
      service.findOne.mockResolvedValueOnce({ ...mockEntry, approvalStatus: ApprovalStatus.APPROVED });
      await expect(controller.update('entry-1', req, {} as any)).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to edit anything', async () => {
      const req = { user: { id: 'user-admin', role: UserRole.ADMIN } };
      await controller.update('entry-1', req, { entry: 'Updated' } as any);
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('review()', () => {
    it('should allow Operator to submit for approval', async () => {
      const req = { user: { id: 'user-op-1', role: UserRole.OPERATOR } };
      await controller.review('entry-1', req, ApprovalStatus.PENDING_APPROVAL);
      expect(service.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ approvalStatus: ApprovalStatus.PENDING_APPROVAL }),
        }),
      );
    });

    it('should throw ForbiddenException if Operator tries to approve', async () => {
      const req = { user: { id: 'user-op-1', role: UserRole.OPERATOR } };
      await expect(controller.review('entry-1', req, ApprovalStatus.APPROVED)).rejects.toThrow(ForbiddenException);
    });
  });



  describe('generateSchema()', () => {
    it('should return a JSON-LD object', async () => {
      const result = await controller.generateSchema('entry-1');
      expect(result).toHaveProperty('@context', 'https://schema.org/');
      expect(result).toHaveProperty('@type', 'DefinedTerm');
      expect(result.name).toBe(mockEntry.entry);
    });
  });
});
