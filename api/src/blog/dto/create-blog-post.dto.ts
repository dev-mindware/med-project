import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { PostType, PostStatus } from '@prisma/client';

export class CreateBlogPostDto {
  @ApiProperty({ description: 'The title of the blog post' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Unique URL-friendly identifier for the post' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'A short summary or excerpt of the post',
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'The main body content of the blog post',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'URL for the post main cover image' })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional video URL associated with the post',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'List of image URLs for a gallery display',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  galleryImageUrls?: string[];

  @ApiProperty({
    enum: PostType,
    description:
      'The format/type of the post: ARTICLE, VIDEO, IMAGE, EVENT_COVERAGE, or ANNOUNCEMENT',
  })
  @IsEnum(PostType)
  type: PostType;

  @ApiPropertyOptional({
    enum: PostStatus,
    default: PostStatus.DRAFT,
    description:
      'Post availability status: DRAFT (Private), PUBLISHED (Public), ARCHIVED (Legacy)',
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Category name for grouping posts' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'List of tags for search and filtering',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Highlight this post as featured',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
