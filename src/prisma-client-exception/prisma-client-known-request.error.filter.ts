//src/prisma-client-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const message = exception.message;

    switch (exception.code) {
      case 'P2002': {
        const statusCode = HttpStatus.CONFLICT;
        const method = request.method;
        const url = request.url;

        response.status(statusCode).json({
          statusCode,
          message: `An instance of the values [${exception?.meta?.target}] already exists`,
          method,
          url,
        });
        break;
      }
      case 'P2025': {
        const statusCode = HttpStatus.NOT_FOUND;
        const method = request.method;
        const url = request.url;
        response.status(statusCode).json({
          statusCode,
          message: !!exception.meta?.cause ? exception.meta.cause : message,
          method,
          url,
        });
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
