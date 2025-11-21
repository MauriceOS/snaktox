import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { Logger } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const corsOrigins = configService.get('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001');
  const allowedOrigins = typeof corsOrigins === 'string' 
    ? corsOrigins.split(',').map(origin => origin.trim())
    : [corsOrigins];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SnaKTox API')
    .setDescription('AI-powered snakebite awareness, detection, and emergency response system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('hospitals', 'Hospital and health facility management')
    .addTag('stock', 'Antivenom stock tracking')
    .addTag('sos', 'Emergency SOS reporting')
    .addTag('education', 'Educational content and awareness')
    .addTag('analytics', 'System analytics and metrics')
    .addTag('ai', 'AI-powered snake detection and chatbot')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', process.env.PORT || 3002);
  await app.listen(port);

  console.log(`🚀 SnaKTox API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
