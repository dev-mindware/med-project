import { PartialType } from '@nestjs/swagger';
import { CreateAnthroponymDto } from './create-anthroponym.dto';

export class UpdateAnthroponymDto extends PartialType(CreateAnthroponymDto) {}
