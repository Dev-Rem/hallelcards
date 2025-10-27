import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Stricter per-IP rate limits for sensitive routes
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 20);
  const purchaseMax = Number(process.env.PURCHASE_RATE_LIMIT_MAX || 30);

  app.use(
    '/auth',
    rateLimit({ windowMs, max: authMax, standardHeaders: true, legacyHeaders: false }),
  );
  app.use(
    ['/purchase', '/purchase/auth'],
    rateLimit({ windowMs, max: purchaseMax, standardHeaders: true, legacyHeaders: false }),
  );

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Gift Card Marketplace API')
    .setDescription(
      'REST API for gift card marketplace (users, admin, cards, purchase, payments)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}
void bootstrap();
