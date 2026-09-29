import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, PostStatus, Prisma } from '@prisma/client';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogPostsFilterDto } from './dto/blog-posts-filter.dto';
import { GlobalFilterDto } from '../common/dto/global-filter.dto';

import { AuthRequest } from '../auth/types/auth-request';
@ApiTags('blog')
@ApiBearerAuth()
@Controller('blog-posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new blog post' })
  create(@Request() req: AuthRequest, @Body() createDto: CreateBlogPostDto) {
    return this.blogService.create({
      ...createDto,
      author: { connect: { id: req.user.id } },
    });
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List blog posts (Public see only PUBLISHED, Admin see all)',
  })
  findAll(@Request() req: AuthRequest, @Query() filters: BlogPostsFilterDto) {
    const {
      page = 1,
      limit = 20,
      orderBy,
      orderDirection,
      category,
      status,
      search,
      startDate,
      endDate,
    } = filters;
    const where: Prisma.BlogPostWhereInput = {};

    // Safety: Public only see PUBLISHED
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      where.status = PostStatus.PUBLISHED;
    } else if (status) {
      where.status = status;
    }

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.blogService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: orderBy
        ? { [orderBy]: orderDirection }
        : { createdAt: 'desc' as Prisma.SortOrder },
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blog post by ID' })
  async findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    const post = await this.blogService.findOne(id);
    if (!post) throw new NotFoundException();

    // Safety: Public only see PUBLISHED
    if (
      post.status !== PostStatus.PUBLISHED &&
      (!req.user || req.user.role !== UserRole.ADMIN)
    ) {
      throw new NotFoundException();
    }

    return post;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a blog post' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBlogPostDto) {
    return this.blogService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a blog post' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Change blog post status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
      },
      required: ['status'],
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PostStatus,
  ) {
    const data: Prisma.BlogPostUpdateInput = { status };
    if (status === PostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }
    return this.blogService.update(id, data);
  }
}
