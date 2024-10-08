import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-filter-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, stopAtFirstError: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}
bootstrap();
