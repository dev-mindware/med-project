import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, BlogPost } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BlogPostCreateInput): Promise<BlogPost> {
    return this.prisma.blogPost.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BlogPostWhereInput;
    orderBy?: Prisma.BlogPostOrderByWithRelationInput;
  }): Promise<BlogPost[]> {
    return this.prisma.blogPost.findMany({
      ...params,
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string): Promise<BlogPost | null> {
    return this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: Prisma.BlogPostUpdateInput): Promise<BlogPost> {
    return this.prisma.blogPost.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<BlogPost> {
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }
}
