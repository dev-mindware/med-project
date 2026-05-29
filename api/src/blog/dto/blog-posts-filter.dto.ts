import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { GlobalFilterDto } from '../../common/dto/global-filter.dto';
import { PostStatus } from '@prisma/client';

export class BlogPostsFilterDto extends GlobalFilterDto {
  @ApiPropertyOptional({ 
    enum: PostStatus,
    description: 'Filter posts by status: DRAFT (Hidden), PUBLISHED (Live), ARCHIVED (Legacy/Hidden)'
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Filter posts by category name' })
  @IsOptional()
  @IsString()
  category?: string;
}
