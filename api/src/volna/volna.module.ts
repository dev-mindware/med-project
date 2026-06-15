import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { VolnaController } from './volna.controller';
import { VolnaService } from './volna.service';

@Module({
  imports: [UsersModule],
  controllers: [VolnaController],
  providers: [VolnaService],
  exports: [VolnaService],
})
export class VolnaModule {}
