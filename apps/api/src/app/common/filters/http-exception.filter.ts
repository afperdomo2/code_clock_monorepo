import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: string;
}

@Catch()
export class HttpExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorBody = this.normalizeException(exception, status);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: errorBody.statusCode,
      message: errorBody.message,
      error: errorBody.error,
      code: errorBody.code,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private normalizeException(exception: unknown, status: number): ErrorBody {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { statusCode: status, message: response };
      }

      if (typeof response === 'object' && response !== null) {
        const payload = response as {
          statusCode?: number;
          message?: string | string[];
          error?: string;
          code?: string;
        };

        return {
          statusCode: payload.statusCode ?? status,
          message: payload.message ?? exception.message,
          error: payload.error,
          code: payload.code,
        };
      }
    }

    return {
      statusCode: status,
      message: 'Internal server error',
    };
  }
}
