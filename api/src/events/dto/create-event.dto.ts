import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsUrl, IsInt, Min } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Unique URL-friendly identifier for the event' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'A detailed description of the event' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'The category this event belongs to' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'URL for the event cover image' })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({ description: 'Event starting date and time' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Event ending date and time' })
  @IsDateString()
  endDate: Date;

  @ApiProperty({ description: 'Physical or virtual location of the event' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Initial registration count (usually 0)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  registrationCount?: number;

  @ApiPropertyOptional({ description: 'Maximum number of attendees allowed for this event' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRegistrations?: number;

  @ApiPropertyOptional({ 
    enum: EventStatus, 
    default: EventStatus.DRAFT,
    description: 'Initial status: DRAFT (Hidden), PUBLISHED (Public)'
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
