import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '@prisma/client';

const mockBlogPost = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Content here',
  status: PostStatus.PUBLISHED,
  authorId: 'user-1',
  author: { id: 'user-1', name: 'Author Name' },
  createdAt: new Date(),
};

const mockPrismaService = {
  blogPost: {
    create: jest.fn().mockResolvedValue(mockBlogPost),
    findMany: jest.fn().mockResolvedValue([mockBlogPost]),
    findUnique: jest.fn().mockResolvedValue(mockBlogPost),
    update: jest.fn().mockResolvedValue(mockBlogPost),
    delete: jest.fn().mockResolvedValue(mockBlogPost),
  },
};

describe('BlogService', () => {
  let service: BlogService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a blog post', async () => {
      const data = { title: 'New Post' } as any;
      const result = await service.create(data);
      expect(result).toEqual(mockBlogPost);
      expect(prisma.blogPost.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('findAll()', () => {
    it('should return blog posts with author info', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockBlogPost]);
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { author: expect.anything() },
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return a blog post by id', async () => {
      const result = await service.findOne('post-1');
      expect(result).toEqual(mockBlogPost);
      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'post-1' },
          include: { author: expect.anything() },
        }),
      );
    });
  });

  describe('update()', () => {
    it('should update a blog post', async () => {
      const result = await service.update('post-1', { title: 'Updated' });
      expect(result).toEqual(mockBlogPost);
      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { title: 'Updated' },
      });
    });
  });

  describe('remove()', () => {
    it('should delete a blog post', async () => {
      const result = await service.remove('post-1');
      expect(result).toEqual(mockBlogPost);
      expect(prisma.blogPost.delete).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });
    });
  });
});
