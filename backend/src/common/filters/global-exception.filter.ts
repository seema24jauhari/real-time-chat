import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import * as express from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<express.Request>();
    const response = ctx.getResponse<express.Response>();

    const errorResponse = exception.getResponse();

    response.status(exception.getStatus()).json({
      ...(typeof errorResponse === 'string'
        ? { message: errorResponse }
        : errorResponse),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
