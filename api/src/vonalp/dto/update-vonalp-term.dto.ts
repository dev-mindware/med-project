import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateVonalpTermDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pronunciation?: string;

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
  syllabicDivision?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  etymology?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstDefinition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  secondDefinition?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiProperty({ required: false, description: 'Permite ADMIN/SUPERVISOR guardar o termo como incompleto.' })
  @IsBoolean()
  @IsOptional()
  saveIncomplete?: boolean;
}
