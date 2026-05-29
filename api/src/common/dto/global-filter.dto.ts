import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class GlobalFilterDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Field name to sort by' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ 
    enum: OrderDirection, 
    default: OrderDirection.DESC,
    description: 'Sort direction: ASC (Ascending/Oldest first), DESC (Descending/Newest first)'
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection = OrderDirection.DESC;

  @ApiPropertyOptional({ description: 'Search query for filtering results' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering results' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering results' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
