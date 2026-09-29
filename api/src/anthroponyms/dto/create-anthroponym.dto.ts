import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnthroponymDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  etymology?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meaning?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  surnameMeaning?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  historicalFigure?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  historicalFigurePseudonym?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  historicalFigureDomain?: string;

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
