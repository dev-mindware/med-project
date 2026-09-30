import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Throttle({
    burst: { limit: 10, ttl: 10000 },
    sustained: { limit: 60, ttl: 60000 },
  })
  @ApiOperation({
    summary: 'Global cross-resource search across all linguistic content',
    description:
      'Performs a simultaneous full-text search across Entries, Toponyms, Anthroponyms and Foreignisms. Only returns APPROVED content.',
  })
  @ApiQuery({ name: 'q', description: 'Search query (máx. 100 caracteres)', required: true })
  @ApiQuery({
    name: 'limit',
    description: 'Max results per resource type (máx. 50)',
    required: false,
  })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('Query must have at least 2 characters');
    }
    if (q.trim().length > 100) {
      throw new BadRequestException('Query cannot exceed 100 characters');
    }
    return this.searchService.globalSearch(
      q.trim(),
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
