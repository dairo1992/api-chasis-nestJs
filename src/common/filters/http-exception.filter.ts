import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ServiceResponse } from '../interfaces/service-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ServiceResponse<null> = {
      success: false,
      message: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message,
      error: typeof exceptionResponse === 'string' ? undefined : (exceptionResponse as any).error,
    };

    response
      .status(status)
      .json(errorResponse);
  }
}
