import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateForeignismDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  originalLanguage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  originCountry?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  adaptedForm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  originalForm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meaning?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  definition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  usageExample?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  field?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  abbreviation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  acronym?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reduction?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shortForm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullForm?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  grammaticalCategory?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isVocabulary?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isVocabularyEP?: boolean;
}
