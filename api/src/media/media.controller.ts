import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request, Query, NotFoundException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Prisma } from '@prisma/client';
import { GlobalFilterDto } from '../common/dto/global-filter.dto';
import type { Request as ExpressRequest } from 'express';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entity: { type: 'string' },
        entityId: { type: 'string' },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest & { user: { id: string } },
    @Body('entity') entity?: string,
    @Body('entityId') entityId?: string,
  ) {
    return this.mediaService.uploadFile(file, req.user.id, entity, entityId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all media assets (Admin only)' })
  findAll(@Query() filters: GlobalFilterDto) {
    const { page = 1, limit = 20, orderBy, orderDirection, search, startDate, endDate } = filters;
    
    const where: Prisma.MediaAssetWhereInput = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.mediaService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy ? { [orderBy]: orderDirection } : { createdAt: 'desc' as Prisma.SortOrder },
      where,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific media asset metadata' })
  async findOne(@Param('id') id: string) {
    const asset = await this.mediaService.findOne(id);
    if (!asset) throw new NotFoundException();
    return asset;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a media asset (Admin only)' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
