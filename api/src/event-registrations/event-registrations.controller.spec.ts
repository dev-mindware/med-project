import { Test, TestingModule } from '@nestjs/testing';
import { EventRegistrationsController } from './event-registrations.controller';
import { EventRegistrationsService } from './event-registrations.service';
import { UserRole, RegistrationStatus } from '@prisma/client';

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  name: 'John Doe',
  email: 'john@example.com',
  status: RegistrationStatus.PENDING,
};

const mockRegistrationsService = {
  create: jest.fn().mockResolvedValue(mockRegistration),
  findAll: jest.fn().mockResolvedValue([mockRegistration]),
  findOne: jest.fn().mockResolvedValue(mockRegistration),
  updateStatus: jest.fn().mockResolvedValue(mockRegistration),
  markAttendance: jest.fn().mockResolvedValue(mockRegistration),
  remove: jest.fn().mockResolvedValue(mockRegistration),
};

describe('EventRegistrationsController', () => {
  let controller: EventRegistrationsController;
  let service: typeof mockRegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventRegistrationsController],
      providers: [
        { provide: EventRegistrationsService, useValue: mockRegistrationsService },
      ],
    }).compile();

    controller = module.get<EventRegistrationsController>(EventRegistrationsController);
    service = module.get(EventRegistrationsService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call service.create', async () => {
      const dto = { eventId: 'event-1', name: 'John Doe', email: 'john@example.com' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll with filters', async () => {
      const filters = { page: 1, limit: 10, eventId: 'event-1' } as any;
      await controller.findAll(filters);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: expect.objectContaining({ eventId: 'event-1' }),
        })
      );
    });
  });

  describe('updateStatus()', () => {
    it('should call service.updateStatus', async () => {
      await controller.updateStatus('reg-1', RegistrationStatus.APPROVED, 'Confirmed');
      expect(service.updateStatus).toHaveBeenCalledWith('reg-1', RegistrationStatus.APPROVED, 'Confirmed');
    });
  });
});
