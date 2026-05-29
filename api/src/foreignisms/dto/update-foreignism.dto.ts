import { PartialType } from '@nestjs/swagger';
import { CreateForeignismDto } from './create-foreignism.dto';

export class UpdateForeignismDto extends PartialType(CreateForeignismDto) {}
