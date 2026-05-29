import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NeologismsController } from './neologisms.controller';
import { NeologismsService } from './neologisms.service';

@Module({
  imports: [UsersModule],
  providers: [NeologismsService],
  controllers: [NeologismsController],
  exports: [NeologismsService],
})
export class NeologismsModule {}
