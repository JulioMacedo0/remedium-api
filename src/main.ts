import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-known-request.error.filter';
import * as cookieParser from 'cookie-parser';
import { PrismaClientValidationFilter } from './prisma-client-exception/prisma-client-validation-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('App');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Remedium API')
    .setDescription('API for medication reminders and alerts management')
    .setVersion('1.0')
    .addTag('authentication', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('medicines', 'Medicine management endpoints')
    .addTag('alerts', 'Alert and notification management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalFilters(new PrismaClientValidationFilter(httpAdapter));

  await app.listen(process.env.PORT);

  logger.log(`Running in port ${process.env.PORT}`);
}
bootstrap();
