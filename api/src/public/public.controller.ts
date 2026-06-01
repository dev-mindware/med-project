import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { VonalpVocabularyType } from '@prisma/client';
import { PublicContentFilterDto } from './dto/public-content-filter.dto';
import { PublicEventRegistrationDto } from './dto/public-event-registration.dto';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas públicas calculadas a partir de conteúdos aprovados e publicados.' })
  publicStats() {
    return this.publicService.stats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Pesquisa global pública em conteúdos aprovados/publicados.' })
  globalSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.search(filters);
  }

  @Get('dictionary')
  @ApiOperation({ summary: 'Listar entradas lexicais aprovadas para o dicionário público.' })
  dictionarySearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.dictionary(filters);
  }

  @Get('dictionary/:id')
  @ApiOperation({ summary: 'Detalhar uma entrada lexical aprovada.' })
  dictionaryDetails(@Param('id') id: string) {
    return this.publicService.dictionaryDetails(id);
  }

  @Get('neologisms')
  @ApiOperation({ summary: 'Listar neologismos aprovados.' })
  neologismSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.neologisms(filters);
  }

  @Get('neologisms/:id')
  @ApiOperation({ summary: 'Detalhar um neologismo aprovado.' })
  neologismDetails(@Param('id') id: string) {
    return this.publicService.neologismDetails(id);
  }

  @Get('toponyms')
  @ApiOperation({ summary: 'Listar topónimos aprovados.' })
  toponymSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.toponyms(filters);
  }

  @Get('toponyms/:id')
  @ApiOperation({ summary: 'Detalhar um topónimo aprovado.' })
  toponymDetails(@Param('id') id: string) {
    return this.publicService.toponymDetails(id);
  }

  @Get('anthroponyms')
  @ApiOperation({ summary: 'Listar antropónimos aprovados.' })
  anthroponymSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.anthroponyms(filters);
  }

  @Get('anthroponyms/:id')
  @ApiOperation({ summary: 'Detalhar um antropónimo aprovado.' })
  anthroponymDetails(@Param('id') id: string) {
    return this.publicService.anthroponymDetails(id);
  }

  @Get('foreignisms')
  @ApiOperation({ summary: 'Listar estrangeirismos aprovados.' })
  foreignismSearch(@Query() filters: PublicContentFilterDto) {
    return this.publicService.foreignisms(filters);
  }

  @Get('foreignisms/:id')
  @ApiOperation({ summary: 'Detalhar um estrangeirismo aprovado.' })
  foreignismDetails(@Param('id') id: string) {
    return this.publicService.foreignismDetails(id);
  }

  @Get('vocabularies/vonalp')
  @ApiOperation({ summary: 'Listar termos VONALP completos e publicados.' })
  publicVonalp(@Query() filters: PublicContentFilterDto) {
    return this.publicService.vocabulary(VonalpVocabularyType.VONALP, filters);
  }

  @Get('vocabularies/vonalpep')
  @ApiOperation({ summary: 'Listar termos VONALP EP completos e publicados.' })
  publicVonalpEp(@Query() filters: PublicContentFilterDto) {
    return this.publicService.vocabulary(VonalpVocabularyType.VONALP_EP, filters);
  }

  @Get('events')
  @ApiOperation({ summary: 'Listar eventos publicados.' })
  publicEvents(@Query() filters: PublicContentFilterDto) {
    return this.publicService.events(filters);
  }

  @Get('events/:idOrSlug')
  @ApiOperation({ summary: 'Detalhar um evento publicado por ID ou slug.' })
  @ApiParam({ name: 'idOrSlug', description: 'ID UUID ou slug público do evento.' })
  publicEventDetails(@Param('idOrSlug') idOrSlug: string) {
    return this.publicService.eventDetails(idOrSlug);
  }

  @Post('events/:idOrSlug/registrations')
  @ApiOperation({ summary: 'Criar inscrição pública num evento publicado.' })
  @ApiParam({ name: 'idOrSlug', description: 'ID UUID ou slug público do evento.' })
  @ApiBody({ type: PublicEventRegistrationDto })
  registerForEvent(
    @Param('idOrSlug') idOrSlug: string,
    @Body() dto: PublicEventRegistrationDto,
  ) {
    return this.publicService.registerForEvent(idOrSlug, dto);
  }

  @Get('blog-posts')
  @ApiOperation({ summary: 'Listar publicações de blog publicadas.' })
  publicBlogPosts(@Query() filters: PublicContentFilterDto) {
    return this.publicService.blogPosts(filters);
  }

  @Get('blog-posts/:idOrSlug')
  @ApiOperation({ summary: 'Detalhar uma publicação publicada por ID ou slug.' })
  @ApiParam({ name: 'idOrSlug', description: 'ID UUID ou slug público da publicação.' })
  publicBlogPostDetails(@Param('idOrSlug') idOrSlug: string) {
    return this.publicService.blogPostDetails(idOrSlug);
  }
}
