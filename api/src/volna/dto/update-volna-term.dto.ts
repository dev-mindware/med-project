import { PartialType } from '@nestjs/swagger';
import { CreateVolnaTermDto } from './create-volna-term.dto';

export class UpdateVolnaTermDto extends PartialType(CreateVolnaTermDto) {}
