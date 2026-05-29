import { Module } from '@nestjs/common';
import { ToponymsService } from './toponyms.service';
import { ToponymsController } from './toponyms.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ToponymsService],
  controllers: [ToponymsController],
  exports: [ToponymsService],
})
export class ToponymsModule {}
