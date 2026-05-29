import { Test, TestingModule } from '@nestjs/testing';
import { EventRegistrationsService } from './event-registrations.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from '../common/mail/mail.service';


const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  maxRegistrations: 10,
  _count: { registrations: 5 },
};

const mockRegistration = {
  id: 'reg-1',
  eventId: 'event-1',
  name: 'John Doe',
  email: 'john@example.com',
  status: RegistrationStatus.PENDING,
  event: {
    title: 'Test Event',
    startDate: new Date(),
    location: 'Test Location',
  },
};


const mockPrismaService: any = {
  event: {
    findUnique: jest.fn().mockResolvedValue(mockEvent),
    update: jest.fn().mockResolvedValue(mockEvent),
  },
  eventRegistration: {
    create: jest.fn().mockResolvedValue(mockRegistration),
    findUnique: jest.fn().mockResolvedValue(mockRegistration),
    findMany: jest.fn().mockResolvedValue([mockRegistration]),
    update: jest.fn().mockResolvedValue(mockRegistration),
    delete: jest.fn().mockResolvedValue(mockRegistration),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

const mockMailService = {
  sendEventInvitationPass: jest.fn().mockResolvedValue(null),
  sendEventRegistrationRejected: jest.fn().mockResolvedValue(null),
};


describe('EventRegistrationsService', () => {
  let service: EventRegistrationsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRegistrationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],

    }).compile();

    service = module.get<EventRegistrationsService>(EventRegistrationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a registration if event exists and not full', async () => {
      prisma.eventRegistration.findUnique.mockResolvedValueOnce(null);
      const result = await service.create({
        eventId: 'event-1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result).toEqual(mockRegistration);
      expect(prisma.eventRegistration.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is full', async () => {
      prisma.event.findUnique.mockResolvedValueOnce({
        ...mockEvent,
        _count: { registrations: 10 },
      });
      await expect(service.create({
        eventId: 'event-1',
        name: 'John Doe',
        email: 'john@example.com',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already registered', async () => {
      prisma.eventRegistration.findUnique.mockResolvedValueOnce(mockRegistration);
      await expect(service.create({
        eventId: 'event-1',
        name: 'John Doe',
        email: 'john@example.com',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus()', () => {
    it('should update status and send email if approved', async () => {
      await service.updateStatus('reg-1', RegistrationStatus.APPROVED);
      expect(prisma.eventRegistration.update).toHaveBeenCalled();
      expect(mockMailService.sendEventInvitationPass).toHaveBeenCalled();
    });
  });

});
