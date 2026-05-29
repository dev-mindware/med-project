import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
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

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ETag-based HTTP Caching (allows CDN / browsers to cache GET responses)
  app.getHttpAdapter().getInstance().set('etag', 'strong');

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
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

  await app.listen(process.env.PORT ?? 4000);
  console.log(`\n🚀 API running on: ${await app.getUrl()}`);
  console.log(`📚 Swagger docs: ${await app.getUrl()}/api/docs\n`);
  console.log(`Scalar docs: ${await app.getUrl()}/api/reference\n`);
}
bootstrap();
