import { PartialType } from '@nestjs/swagger';
import { CreateToponymDto } from './create-toponym.dto';

export class UpdateToponymDto extends PartialType(CreateToponymDto) {}
