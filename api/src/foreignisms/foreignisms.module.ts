import { Module } from '@nestjs/common';
import { ForeignismsService } from './foreignisms.service';
import { ForeignismsController } from './foreignisms.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ForeignismsService],
  controllers: [ForeignismsController],
  exports: [ForeignismsService],
})
export class ForeignismsModule {}
