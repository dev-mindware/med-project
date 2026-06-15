import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MarkVonalpDto } from './dto/mark-vonalp.dto';
import { UpdateVonalpTermDto } from './dto/update-vonalp-term.dto';
import { VonalpFilterDto } from './dto/vonalp-filter.dto';
import { VonalpService } from './vonalp.service';

@ApiTags('vonalp')
@ApiBearerAuth()
@Controller('vonalp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VonalpController {
  constructor(private readonly vonalpService: VonalpService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Listar vocábulos VONALP/VONALP-EP internos' })
  findAll(@Request() req: any, @Query() filters: VonalpFilterDto) {
    return this.vonalpService.findAll(filters, req.user);
  }

  @Post('mark')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Marcar um vocábulo como VONALP ou VONALP-EP' })
  mark(@Request() req: any, @Body() dto: MarkVonalpDto) {
    return this.vonalpService.mark(dto, req.user);
  }

  @Post('unmark')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Desmarcar um vocábulo como VONALP ou VONALP-EP' })
  unmark(@Request() req: any, @Body() dto: MarkVonalpDto) {
    return this.vonalpService.unmark(dto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Actualizar campos obrigatórios de um vocábulo VONALP' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateVonalpTermDto) {
    return this.vonalpService.update(id, dto, req.user);
  }
}
