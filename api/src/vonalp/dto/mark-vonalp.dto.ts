import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { VonalpSourceType, VonalpVocabularyType } from '@prisma/client';

export class MarkVonalpDto {
  @ApiProperty({ enum: VonalpSourceType })
  @IsEnum(VonalpSourceType)
  sourceType: VonalpSourceType;

  @ApiProperty()
  @IsUUID()
  sourceId: string;

  @ApiProperty({ enum: VonalpVocabularyType })
  @IsEnum(VonalpVocabularyType)
  vocabularyType: VonalpVocabularyType;
}
