import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should handle favicon request', () => {
      expect(appController.getFavicon()).toBeUndefined();
    });

    it('should handle docs redirect', () => {
      expect(appController.getDocs()).toBeUndefined();
    });

    it('should handle reference redirect', () => {
      expect(appController.getReference()).toBeUndefined();
    });
  });
});
