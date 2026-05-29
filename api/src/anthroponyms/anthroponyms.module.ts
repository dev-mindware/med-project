import { Module } from '@nestjs/common';
import { AnthroponymsService } from './anthroponyms.service';
import { AnthroponymsController } from './anthroponyms.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AnthroponymsService],
  controllers: [AnthroponymsController],
  exports: [AnthroponymsService],
})
export class AnthroponymsModule {}
