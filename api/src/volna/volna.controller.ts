import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApprovalStatus, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateVolnaTermDto } from './dto/create-volna-term.dto';
import { UpdateVolnaTermDto } from './dto/update-volna-term.dto';
import { VolnaFilterDto } from './dto/volna-filter.dto';
import { VolnaService } from './volna.service';

@ApiTags('volna')
@ApiBearerAuth()
@Controller('volna')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VolnaController {
  constructor(private readonly volnaService: VolnaService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Criar vocábulo VOLNA' })
  create(@Request() req: any, @Body() dto: CreateVolnaTermDto) {
    return this.volnaService.create(dto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Listar vocábulos VOLNA' })
  findAll(@Request() req: any, @Query() filters: VolnaFilterDto) {
    return this.volnaService.findAll(filters, req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Detalhar vocábulo VOLNA' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.volnaService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Actualizar vocábulo VOLNA' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateVolnaTermDto) {
    return this.volnaService.update(id, dto, req.user);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Actualizar estado de publicação da VOLNA' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'] },
        reason: { type: 'string' },
      },
      required: ['status'],
    },
  })
  review(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: ApprovalStatus,
    @Body('reason') reason?: string,
  ) {
    return this.volnaService.review(id, status, reason, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Eliminar vocábulo VOLNA' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.volnaService.remove(id, req.user);
  }
}
