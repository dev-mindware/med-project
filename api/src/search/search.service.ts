import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, limit = 10) {
    const searchQuery = query
      .trim()
      .split(/\s+/)
      .map(w => `${w}:*`)
      .join(' | ');

    const [entries, neologisms, toponyms, anthroponyms, foreignisms] = await Promise.all([
      this.prisma.entry.findMany({
        take: limit,
        where: {
          approvalStatus: 'APPROVED',
          OR: [
            { entry: { search: searchQuery } },
            { firstDefinition: { search: searchQuery } },
            { entry: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, entry: true, firstDefinition: true, createdAt: true },
      }),

      this.prisma.neologism.findMany({
        take: limit,
        where: {
          approvalStatus: 'APPROVED',
          OR: [
            { entry: { search: searchQuery } },
            { firstDefinition: { search: searchQuery } },
            { entry: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, entry: true, firstDefinition: true, createdAt: true },
      }),

      this.prisma.toponym.findMany({
        take: limit,
        where: {
          approvalStatus: 'APPROVED',
          OR: [
            { toponym: { search: searchQuery } },
            { meaning: { search: searchQuery } },
            { toponym: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, toponym: true, meaning: true, province: true },
      }),

      this.prisma.anthroponym.findMany({
        take: limit,
        where: {
          approvalStatus: 'APPROVED',
          OR: [
            { name: { search: searchQuery } },
            { meaning: { search: searchQuery } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, meaning: true, gender: true },
      }),

      this.prisma.foreignism.findMany({
        take: limit,
        where: {
          approvalStatus: 'APPROVED',
          OR: [
            { term: { search: searchQuery } },
            { definition: { search: searchQuery } },
            { term: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { id: true, term: true, definition: true, originalLanguage: true },
      }),
    ]);

    const totalHits =
      entries.length + neologisms.length + toponyms.length + anthroponyms.length + foreignisms.length;

    return {
      query,
      totalHits,
      results: {
        entries: {
          count: entries.length,
          items: entries.map(e => ({ ...e, _type: 'entry', _url: `/entries/${e.id}` })),
        },
        neologisms: {
          count: neologisms.length,
          items: neologisms.map(e => ({ ...e, _type: 'neologism', _url: `/neologisms/${e.id}` })),
        },
        toponyms: {
          count: toponyms.length,
          items: toponyms.map(t => ({ ...t, _type: 'toponym', _url: `/toponyms/${t.id}` })),
        },
        anthroponyms: {
          count: anthroponyms.length,
          items: anthroponyms.map(a => ({
            ...a,
            _type: 'anthroponym',
            _url: `/anthroponyms/${a.id}`,
          })),
        },
        foreignisms: {
          count: foreignisms.length,
          items: foreignisms.map(f => ({
            ...f,
            _type: 'foreignism',
            _url: `/foreignisms/${f.id}`,
          })),
        },
      },
    };
  }
}
