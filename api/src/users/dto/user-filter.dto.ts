import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { GlobalFilterDto } from '../../common/dto/global-filter.dto';

export class UserFilterDto extends GlobalFilterDto {
  @ApiPropertyOptional({ 
    enum: UserRole, 
    description: 'Filter users by role: ADMIN, SUPERVISOR, or OPERATOR' 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ 
    description: 'Filter users by active status',
    type: 'string'
  })
  @IsOptional()
  isActive?: string;
}

