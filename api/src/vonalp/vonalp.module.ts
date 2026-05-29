import { Module } from '@nestjs/common';
import { VonalpController } from './vonalp.controller';
import { VonalpService } from './vonalp.service';

@Module({
  controllers: [VonalpController],
  providers: [VonalpService],
  exports: [VonalpService],
})
export class VonalpModule {}
