import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MedicinesModule } from './medicines/medicines.module';
import { AlertsModule } from './alerts/alerts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { OneSignalModule } from './onesignal/onesignal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    MedicinesModule,
    AlertsModule,
    OneSignalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
