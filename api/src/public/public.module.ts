import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { EntriesModule } from '../entries/entries.module';
import { ToponymsModule } from '../toponyms/toponyms.module';
import { AnthroponymsModule } from '../anthroponyms/anthroponyms.module';
import { ForeignismsModule } from '../foreignisms/foreignisms.module';
import { EventsModule } from '../events/events.module';
import { VonalpModule } from '../vonalp/vonalp.module';
import { VolnaModule } from '../volna/volna.module';
import { PublicService } from './public.service';


@Module({
  imports: [
    EntriesModule,
    ToponymsModule,
    AnthroponymsModule,
    ForeignismsModule,
    EventsModule,
    VonalpModule,
    VolnaModule,

  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
