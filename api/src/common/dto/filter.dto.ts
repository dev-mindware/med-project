import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { GlobalFilterDto } from './global-filter.dto';

export class LinguisticFilterDto extends GlobalFilterDto {


  @ApiPropertyOptional({ 
    enum: ApprovalStatus,
    description: 'Filter by approval status: DRAFT (Work in progress), PENDING_APPROVAL (Awaiting review), APPROVED (Finalized/Dictionary-ready), REJECTED (Declined), NEEDS_CORRECTION (Sent back for fixes), ARCHIVED (Legacy)'
  })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ description: 'Filter entries marked as vocabulary terms' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVocabulary?: boolean;

  @ApiPropertyOptional({ description: 'Filter entries marked as vocabulary terms (EP version)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVocabularyEP?: boolean;


  @ApiPropertyOptional({ description: 'Filter entries marked as foreignisms (borrowed words)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isForeignism?: boolean;

  @ApiPropertyOptional({ description: 'Filter entries created by a specific user ID' })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({ description: 'Filter linguistic records by language code, e.g. pt, kmb, umb' })
  @IsOptional()
  @IsString()
  languageCode?: string;
}
