import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';
import { GlobalFilterDto } from '../../common/dto/global-filter.dto';

export class RegistrationFilterDto extends GlobalFilterDto {
  @ApiPropertyOptional({ description: 'Filter registrations by a specific event ID' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({ 
    enum: RegistrationStatus,
    description: 'Filter by registration status: PENDING (New/Awaiting review), APPROVED (Confirmed/Pass sent), REJECTED (Declined), CANCELLED (Aborted), ATTENDED (Presence confirmed)'
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

}
