import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateToponymDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toponym: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meaning?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  municipality?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gentilic?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  locationImage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  toponymHistory?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  toponymProvenance?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  commonUsage?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  graphicVariation?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  toponymClasses?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  toponymSubclasses?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  languageCode?: string;

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
