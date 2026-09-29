import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImportRowDto {
  @IsInt()
  @Min(2)
  rowNumber: number;

  @IsObject()
  data: Record<string, unknown>;
}

export class ImportRowsDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ImportRowDto)
  rows: ImportRowDto[];
}
