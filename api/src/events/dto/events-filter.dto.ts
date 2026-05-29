import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { GlobalFilterDto } from '../../common/dto/global-filter.dto';
import { EventStatus } from '@prisma/client';

export enum EventPeriod {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
}

export class EventsFilterDto extends GlobalFilterDto {
  @ApiPropertyOptional({ 
    enum: EventPeriod,
    description: 'Filter events by time period: upcoming (future), ongoing (currently happening), or past (already ended)'
  })
  @IsOptional()
  @IsEnum(EventPeriod)
  period?: EventPeriod;

  @ApiPropertyOptional({ description: 'Filter events by their assigned category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    enum: EventStatus,
    description: 'Filter events by their current status: DRAFT (Internal only), PUBLISHED (Visible to public), CANCELLED (Event aborted), ARCHIVED (Historical record)'
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
