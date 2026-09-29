import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';
import { RegistrationStatus, Prisma } from '@prisma/client';
import { MailService } from '../common/mail/mail.service';

@Injectable()
export class EventRegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(createDto: CreateRegistrationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: createDto.eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (
      event.maxRegistrations &&
      event._count.registrations >= event.maxRegistrations
    ) {
      throw new BadRequestException('Event registration is full');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_email: {
          eventId: createDto.eventId,
          email: createDto.email,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You are already registered for this event',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.create({
        data: createDto,
      });

      await tx.event.update({
        where: { id: createDto.eventId },
        data: { registrationCount: { increment: 1 } },
      });

      return registration;
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventRegistrationWhereInput;
    orderBy?: Prisma.EventRegistrationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.eventRegistration.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { event: true },
    });
  }

  async findOne(id: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!registration) throw new NotFoundException('Registration not found');
    return registration;
  }

  async updateStatus(id: string, status: RegistrationStatus, notes?: string) {
    const registration = await this.prisma.eventRegistration.update({
      where: { id },
      data: { status, notes },
      include: { event: true },
    });

    if (status === RegistrationStatus.APPROVED) {
      await this.mailService.sendEventInvitationPass(
        registration.email,
        registration.name,
        registration.event.title,
        registration.event.startDate.toLocaleDateString('pt-PT'),
        registration.event.location,
        registration.id.substring(0, 8).toUpperCase(), // Short ID as "Pass ID"
      );
    } else if (
      status === RegistrationStatus.REJECTED ||
      status === RegistrationStatus.CANCELLED
    ) {
      await this.mailService.sendEventRegistrationRejected(
        registration.email,
        registration.name,
        registration.event.title,
        notes,
      );
    }

    return registration;
  }

  async markAttendance(id: string, attended: boolean) {
    return this.prisma.eventRegistration.update({
      where: { id },
      data: { attended },
    });
  }

  async remove(id: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id },
    });
    if (!registration) throw new NotFoundException('Registration not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: registration.eventId },
        data: { registrationCount: { decrement: 1 } },
      });

      return tx.eventRegistration.delete({ where: { id } });
    });
  }
}
