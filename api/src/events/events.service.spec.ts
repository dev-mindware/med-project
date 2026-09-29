import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventStatus } from '@prisma/client';

const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  status: EventStatus.PUBLISHED,
  createdById: 'user-1',
  createdBy: { id: 'user-1', name: 'User Name' },
  createdAt: new Date(),
};

const mockPrismaService = {
  event: {
    create: jest.fn().mockResolvedValue(mockEvent),
    findMany: jest.fn().mockResolvedValue([mockEvent]),
    findUnique: jest.fn().mockResolvedValue(mockEvent),
    findFirst: jest.fn().mockResolvedValue(mockEvent),
    update: jest.fn().mockResolvedValue(mockEvent),
    delete: jest.fn().mockResolvedValue(mockEvent),
  },
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create an event', async () => {
      const data = { title: 'New Event' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll()', () => {
    it('should return events with creator info', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockEvent]);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { createdBy: expect.anything() },
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return an event by id', async () => {
      const result = await service.findOne('event-1');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ id: 'event-1' }, { slug: 'event-1' }],
          },
          include: { createdBy: expect.anything() },
        }),
      );
    });
  });

  describe('update()', () => {
    it('should update an event', async () => {
      const result = await service.update('event-1', { title: 'Updated' });
      expect(result).toEqual(mockEvent);
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: { title: 'Updated' },
      });
    });
  });

  describe('remove()', () => {
    it('should delete an event', async () => {
      const result = await service.remove('event-1');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-1' },
      });
    });
  });
});
