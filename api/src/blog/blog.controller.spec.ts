import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserRole, PostStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockBlogPost = {
  id: 'post-1',
  title: 'Test Post',
  status: PostStatus.DRAFT,
  authorId: 'user-1',
};

const mockBlogService = {
  create: jest.fn().mockResolvedValue(mockBlogPost),
  findAll: jest.fn().mockResolvedValue([mockBlogPost]),
  findOne: jest.fn().mockResolvedValue(mockBlogPost),
  update: jest.fn().mockResolvedValue(mockBlogPost),
  remove: jest.fn().mockResolvedValue(mockBlogPost),
};

describe('BlogController', () => {
  let controller: BlogController;
  let service: typeof mockBlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        { provide: BlogService, useValue: mockBlogService },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get(BlogService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should call service.create', async () => {
      const req = { user: { id: 'user-1' } };
      await controller.create(req, { title: 'New Post' } as any);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll with filters', async () => {
      const req = { user: { role: UserRole.ADMIN } };
      const filters = { page: 1, limit: 10, status: PostStatus.PUBLISHED, category: 'category' } as any;
      await controller.findAll(req, filters);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ 
          skip: 0, 
          take: 10,
          where: expect.objectContaining({ status: PostStatus.PUBLISHED, category: 'category' })
        })
      );
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException if post not found', async () => {
      service.findOne.mockResolvedValueOnce(null);
      await expect(controller.findOne({}, 'ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus()', () => {
    it('should call service.update with publishedAt if status is PUBLISHED', async () => {
      await controller.updateStatus('post-1', PostStatus.PUBLISHED);
      expect(service.update).toHaveBeenCalledWith('post-1', expect.objectContaining({ 
        status: PostStatus.PUBLISHED,
        publishedAt: expect.any(Date)
      }));
    });
  });
});
