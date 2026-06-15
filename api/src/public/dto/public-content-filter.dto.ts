import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum PublicEventPeriod {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
}

export class PublicContentFilterDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Texto livre para pesquisa.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Alias de q, útil para compatibilidade com clientes existentes.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Categoria ou área editorial, quando aplicável.' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Categoria gramatical, usada em entradas, neologismos, estrangeirismos e VONALP.' })
  @IsOptional()
  @IsString()
  grammaticalCategory?: string;

  @ApiPropertyOptional({ description: 'Subcategoria gramatical, usada em entradas e neologismos.' })
  @IsOptional()
  @IsString()
  grammaticalSubcategory?: string;

  @ApiPropertyOptional({ description: 'Código da língua, usado em entradas, neologismos e topónimos.' })
  @IsOptional()
  @IsString()
  languageCode?: string;

  @ApiPropertyOptional({ description: 'Língua nacional, usada na VOLNA.' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Província, usado em topónimos.' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Município, usado em topónimos.' })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional({ description: 'Genero, usado em antroponimos.' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Lingua original, usada em estrangeirismos.' })
  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @ApiPropertyOptional({ description: 'Pais de origem, usado em estrangeirismos.' })
  @IsOptional()
  @IsString()
  originCountry?: string;

  @ApiPropertyOptional({ description: 'Area ou dominio, usado em estrangeirismos.' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ enum: PublicEventPeriod, description: 'Filtro temporal para eventos.' })
  @IsOptional()
  @IsEnum(PublicEventPeriod)
  period?: PublicEventPeriod;
}
