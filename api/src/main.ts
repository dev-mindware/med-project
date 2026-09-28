import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AppLogger } from './common/logger/app-logger.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
        },
      },
    }),
  );

  app.enableCors({
    origin: (config.get<string[]>('app.frontendUrls') ?? []).length > 0 ? config.get<string[]>('app.frontendUrls') : false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  });

  app.getHttpAdapter().getInstance().set('etag', 'strong');
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Linguistic API')
    .setDescription('Sistema Linguístico - API completa com busca global, relatórios e gestão de conteúdo')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('search', 'Busca global cross-resource')
    .addTag('entries', 'Entradas lexicais')
    .addTag('neologisms', 'Neologismos')
    .addTag('toponyms', 'Topónimos')
    .addTag('anthroponyms', 'Antropónimos')
    .addTag('foreignisms', 'Estrangeirismos')
    .addTag('blog', 'Blog')
    .addTag('events', 'Eventos')
    .addTag('media', 'Gestão de Media (Cloudflare R2)')
    .addTag('reports', 'Relatórios Excel')
    .addTag('stats', 'Estatísticas')
    .addTag('event-registrations', 'Inscrições em Eventos')
    .addTag('audit-logs', 'Auditoria')
    .addTag('manual-vocabulary', 'Extração inteligente de vocabulário a partir de PDFs')
    .addTag('users', 'Utilizadores')
    .addTag('auth', 'Autenticação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.getHttpAdapter().getInstance().get('/api/openapi.json', (_req: any, res: any) => res.json(document));
  app.use(
    '/api/reference',
    apiReference({
      url: '/api/openapi.json',
      theme: 'purple',
      darkMode: true,
      pageTitle: 'Linguistic API Reference',
    }),
  );
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  });

  await app.listen(config.get<number>('app.port') ?? 4000);
  const url = await app.getUrl();
  logger.info('API started', {
    context: 'Bootstrap',
    action: 'API_STARTED',
    meta: {
      url,
      swaggerDocs: `${url}/api/docs`,
      scalarDocs: `${url}/api/reference`,
    },
  });
}

bootstrap();
