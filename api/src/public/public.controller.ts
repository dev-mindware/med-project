import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Optional,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { VonalpVocabularyType } from '@prisma/client';
import { PublicContentFilterDto } from './dto/public-content-filter.dto';
import { PublicEventRegistrationDto } from './dto/public-event-registration.dto';
import { PublicService } from './public.service';
import { AbuseProtectionGuard } from '../common/guards/abuse-protection.guard';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    @Optional() private readonly abuseGuard?: AbuseProtectionGuard,
  ) {}

  // Honeypot endpoints para capturar e banir scrapers/bots automaticamente
  @Get(['export', 'all', 'dump'])
  @ApiOperation({ summary: 'Endpoint restrito / honeypot' })
  async honeypotTrigger(@Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (this.abuseGuard) {
      await this.abuseGuard.banIp(
        ip,
        `Acesso a endpoint honeypot: ${req.path}`,
        3_600_000,
      );
    }
    throw new HttpException(
      'Acesso proibido. O seu endereço IP foi temporariamente bloqueado.',
      HttpStatus.FORBIDDEN,
    );
  }

  @Get('stats')
  @Header('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate=600')
  @ApiOperation({
    summary:
      'Estatísticas públicas calculadas a partir de conteúdos aprovados e publicados.',
  })
  publicStats() {
    return this.publicService.stats();
  }

  @Get('suggest')
  @Throttle({
    burst: { limit: 25, ttl: 10000 },
    sustained: { limit: 120, ttl: 60000 },
  })
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Sugestões rápidas de autocomplete para pesquisa global.',
  })
  suggest(@Query('q') q?: string) {
    if (q && q.length > 100) {
      throw new BadRequestException('Termo de pesquisa demasiado longo (máx. 100 caracteres)');
    }
    return this.publicService.suggest(q ?? '');
  }

  @Get('search')
  @Throttle({
    burst: { limit: 10, ttl: 10000 },
    sustained: { limit: 60, ttl: 60000 },
  })
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Pesquisa global pública em conteúdos aprovados/publicados.',
  })
  globalSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.search(filters);
  }

  @Get('dictionary')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Listar entradas lexicais aprovadas para o dicionário público.',
  })
  dictionarySearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.dictionary(filters);
  }

  @Get('dictionary/:id')
  @ApiOperation({ summary: 'Detalhar uma entrada lexical aprovada.' })
  dictionaryDetails(@Param('id') id: string) {
    return this.publicService.dictionaryDetails(id);
  }

  @Get('neologisms')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar neologismos aprovados.' })
  neologismSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.neologisms(filters);
  }

  @Get('neologisms/:id')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'Detalhar um neologismo aprovado.' })
  neologismDetails(@Param('id') id: string) {
    return this.publicService.neologismDetails(id);
  }

  @Get('toponyms')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar topónimos aprovados.' })
  toponymSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.toponyms(filters);
  }

  @Get('toponyms/:id')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'Detalhar um topónimo aprovado.' })
  toponymDetails(@Param('id') id: string) {
    return this.publicService.toponymDetails(id);
  }

  @Get('anthroponyms')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar antropónimos aprovados.' })
  anthroponymSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.anthroponyms(filters);
  }

  @Get('anthroponyms/:id')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'Detalhar um antropónimo aprovado.' })
  anthroponymDetails(@Param('id') id: string) {
    return this.publicService.anthroponymDetails(id);
  }

  @Get('foreignisms')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar estrangeirismos aprovados.' })
  foreignismSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.foreignisms(filters);
  }

  @Get('foreignisms/:id')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'Detalhar um estrangeirismo aprovado.' })
  foreignismDetails(@Param('id') id: string) {
    return this.publicService.foreignismDetails(id);
  }

  @Get('vocabularies/vonalp')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar vocábulos VONALP completos e publicados.' })
  publicVonalp(@Query() filters: PublicContentFilterDto) {
    return this.publicService.vocabulary(VonalpVocabularyType.VONALP, filters);
  }

  @Get('vocabularies/vonalpep')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({
    summary: 'Listar vocábulos VONALP-EP completos e publicados.',
  })
  publicVonalpEp(@Query() filters: PublicContentFilterDto) {
    return this.publicService.vocabulary(
      VonalpVocabularyType.VONALP_EP,
      filters,
    );
  }

  @Get('vocabularies/volna')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar vocábulos VOLNA publicados.' })
  publicVolna(@Query() filters: PublicContentFilterDto) {
    return this.publicService.volna(filters);
  }

  @Get('events')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar eventos publicados.' })
  publicEvents(@Query() filters: PublicContentFilterDto) {
    return this.publicService.events(filters);
  }

  @Get('events/:idOrSlug')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({ summary: 'Detalhar um evento publicado por ID ou slug.' })
  @ApiParam({
    name: 'idOrSlug',
    description: 'ID UUID ou slug público do evento.',
  })
  publicEventDetails(@Param('idOrSlug') idOrSlug: string) {
    return this.publicService.eventDetails(idOrSlug);
  }

  @Post('events/:idOrSlug/registrations')
  @ApiOperation({ summary: 'Criar inscrição pública num evento publicado.' })
  @ApiParam({
    name: 'idOrSlug',
    description: 'ID UUID ou slug público do evento.',
  })
  @ApiBody({ type: PublicEventRegistrationDto })
  registerForEvent(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: PublicEventRegistrationDto,
  ) {
    return this.publicService.registerForEvent(idOrSlug, dto);
  }

  @Get('blog-posts')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  @ApiOperation({ summary: 'Listar publicações de blog publicadas.' })
  publicBlogPosts(@Query() filters: PublicContentFilterDto) {
    return this.publicService.blogPosts(filters);
  }

  @Get('blog-posts/:idOrSlug')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')
  @ApiOperation({
    summary: 'Detalhar uma publicação publicada por ID ou slug.',
  })
  @ApiParam({
    name: 'idOrSlug',
    description: 'ID UUID ou slug público da publicação.',
  })
  publicBlogPostDetails(@Param('idOrSlug') idOrSlug: string) {
    return this.publicService.blogPostDetails(idOrSlug);
  }
}
