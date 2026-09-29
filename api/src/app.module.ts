import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { ToponymsModule } from './toponyms/toponyms.module';
import { AnthroponymsModule } from './anthroponyms/anthroponyms.module';
import { ForeignismsModule } from './foreignisms/foreignisms.module';
import { NeologismsModule } from './neologisms/neologisms.module';
import { PublicController } from './public/public.controller';
import { PublicModule } from './public/public.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BlogModule } from './blog/blog.module';
import { EventsModule } from './events/events.module';
import { StatsModule } from './stats/stats.module';
import { MediaModule } from './media/media.module';
import { MailModule } from './common/mail/mail.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { EventRegistrationsModule } from './event-registrations/event-registrations.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { NotificationsModule } from './notifications/notifications.module';
import { VonalpModule } from './vonalp/vonalp.module';
import { VolnaModule } from './volna/volna.module';
import { ManualVocabularyModule } from './manual-vocabulary/manual-vocabulary.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggerModule } from './common/logger/logger.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    EntriesModule,
    ToponymsModule,
    AnthroponymsModule,
    ForeignismsModule,
    NeologismsModule,
    PublicModule,
    AuditLogsModule,
    BlogModule,
    EventsModule,
    StatsModule,
    MediaModule,
    MailModule,
    ReportsModule,
    SearchModule,
    EventRegistrationsModule,
    NotificationsModule,
    VonalpModule,
    VolnaModule,
    ManualVocabularyModule,
  ],
  providers: [
    AppService,
    AllExceptionsFilter,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
