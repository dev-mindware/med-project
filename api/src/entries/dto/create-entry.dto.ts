import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entry: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  syllabicDivision?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  etymology?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstDefinition: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secondDefinition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thirdDefinition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  usageExample?: string;

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
  acronymMeaning?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reduction?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reductionMeaning?: string;

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
  @IsString()
  @IsOptional()
  grammaticalSubcategory?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  grammaticalStatus?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isVocabulary?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isVocabularyEP?: boolean;


  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isForeignism?: boolean;
}
