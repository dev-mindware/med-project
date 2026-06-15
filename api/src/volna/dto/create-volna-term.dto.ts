import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVolnaTermDto {
  @ApiProperty({ description: 'Vocábulo registado na VOLNA.' })
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ description: 'Língua nacional de Angola.' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  grammaticalCategory?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  grammaticalSubcategory?: string;

  @ApiProperty({ description: 'Definição do vocábulo.' })
  @IsString()
  @IsNotEmpty()
  definition: string;

  @ApiPropertyOptional({ description: 'Exemplo de uso.' })
  @IsString()
  @IsOptional()
  usageExample?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
