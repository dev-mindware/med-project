import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import {
  VonalpCompletionStatus,
  VonalpSourceType,
  VonalpVocabularyType,
} from '@prisma/client';

export class VonalpFilterDto {
  @ApiProperty({ enum: VonalpVocabularyType, required: false })
  @IsEnum(VonalpVocabularyType)
  @IsOptional()
  vocabularyType?: VonalpVocabularyType;

  @ApiProperty({ enum: VonalpSourceType, required: false })
  @IsEnum(VonalpSourceType)
  @IsOptional()
  sourceType?: VonalpSourceType;

  @ApiProperty({ enum: VonalpCompletionStatus, required: false })
  @IsEnum(VonalpCompletionStatus)
  @IsOptional()
  completionStatus?: VonalpCompletionStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => Number(value || 1))
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @Transform(({ value }) => Number(value || 20))
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
