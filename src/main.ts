import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-filter-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { getCorsOptions } from './common/utils/cors.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
  const corsAllowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS').split(',');

  app.use(cookieParser());

  app.enableCors(getCorsOptions(corsAllowedOrigins));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  if (isDevelopment) {
    const config = new DocumentBuilder().setTitle('fur-ever-friends API').addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
