import { PartialType } from '@nestjs/swagger';
import { CreateNeologismDto } from './create-neologism.dto';

export class UpdateNeologismDto extends PartialType(CreateNeologismDto) {}
