import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { UserRole, EventStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  status: EventStatus.DRAFT,
  createdById: 'user-1',
};

const mockEventsService = {
  create: jest.fn().mockResolvedValue(mockEvent),
  findAll: jest.fn().mockResolvedValue([mockEvent]),
  findOne: jest.fn().mockResolvedValue(mockEvent),
  update: jest.fn().mockResolvedValue(mockEvent),
  remove: jest.fn().mockResolvedValue(mockEvent),
};

describe('EventsController', () => {
  let controller: EventsController;
  let service: typeof mockEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call service.create', async () => {
      const req = { user: { id: 'user-1' } };
      await controller.create(req, { title: 'New Event' } as any);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll with period filters', async () => {
      const req = { user: { role: UserRole.ADMIN } };
      const filters = { page: 1, limit: 10, period: 'upcoming', category: 'category' } as any;
      await controller.findAll(req, filters);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ 
          skip: 0, 
          take: 10,
          where: expect.objectContaining({ 
            category: 'category',
            startDate: expect.any(Object)
          })
        })
      );
    });
  });

  describe('updateStatus()', () => {
    it('should call update with cancelledAt if status is CANCELLED', async () => {
      await controller.updateStatus('event-1', EventStatus.CANCELLED, 'Rain');
      expect(service.update).toHaveBeenCalledWith('event-1', expect.objectContaining({ 
        status: EventStatus.CANCELLED,
        cancelledAt: expect.any(Date),
        cancellationReason: 'Rain'
      }));
    });
  });
});
