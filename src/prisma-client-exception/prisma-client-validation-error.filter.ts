//src/prisma-client-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientValidationError)
export class PrismaClientValidationFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    //    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    //   const message = exception.message;

    switch (exception.name) {
      case 'PrismaClientValidationError': {
        const statusCode = HttpStatus.BAD_REQUEST;

        response.status(statusCode).json();
        break;
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
