import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OneSignalModule } from 'src/onesignal/onesignal.module';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
  imports: [PrismaModule, OneSignalModule],
})
export class AlertsModule {}
