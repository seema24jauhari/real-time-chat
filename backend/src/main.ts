import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser'; // ← default import (no * as)
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // ← must be here
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formatted: Record<string, string> = {};

        errors.forEach((error) => {
          formatted[error.property] = Object.values(error.constraints ?? {})[0];
        });

        return new BadRequestException({
          message: 'Validation failed',
          errors: formatted,
          code: HttpStatus.BAD_REQUEST,
        });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
