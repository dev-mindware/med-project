import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

export class VolnaFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Língua nacional de Angola.' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  grammaticalCategory?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  grammaticalSubcategory?: string;

  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value || 1))
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value || 20))
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
