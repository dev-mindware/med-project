import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignSupervisorOperatorsDto {
  @ApiProperty({
    description: 'Operator user IDs that should be managed by this supervisor',
    type: [String],
    example: ['7c1e5f24-62dd-4ad6-9d8b-dfd2f26f9a2d'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  operatorIds: string[];
}
