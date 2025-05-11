import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

import {
  differenceInMinutes,
  isSameHour,
  isSameMinute,
  isToday,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { isAlertDay } from 'src/helpers/isAlertDay';
import { dayOfWeekToNumber } from 'src/helpers/dayOfWeekToNumber';
import { createOneSignalMessage } from 'src/helpers/createOneSignalMessage';
import { Alert, AlertType, User } from '@prisma/client';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { DebugNotificationDto } from './dto/debug-notification.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  constructor(
    private prisma: PrismaService,
    private oneSignalService: OneSignalService,
  ) {}

  create(id: string, createAlertDto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: {
        title: createAlertDto.title,
        body: createAlertDto.body,
        subtitle: createAlertDto.subtitle,
        trigger: {
          create: { ...createAlertDto.trigger, last_alert: new Date() },
        },
        user: {
          connect: { id },
        },
      },

      include: {
        trigger: true,
      },
    });
  }

  async findAll(id: string) {
    const alerts = await this.prisma.alert.findMany({
      where: { userId: id },
      include: {
        trigger: true,
      },
    });

    return alerts;
  }

  async findOne(id: string, userId: string) {
    const alert = await this.prisma.alert.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        trigger: true,
        user: true,
      },
    });

    if (alert.userId != userId) throw new UnauthorizedException();

    return alert;
  }

  async update(id: string, updateAlertDto: UpdateAlertDto, userId: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        body: updateAlertDto.body,
        title: updateAlertDto.title,
        subtitle: updateAlertDto.subtitle,
        trigger: {
          update: updateAlertDto.trigger,
        },
      },
      include: {
        trigger: true,
      },
    });

    if (alert.userId != userId) throw new UnauthorizedException();

    return alert;
  }

  async remove(id: string, userId: string) {
    const alert = await this.prisma.alert.delete({
      where: { id },
    });

    if (alert.userId != userId) throw new UnauthorizedException();

    return alert;
  }

  // Método auxiliar para enviar notificações via OneSignal
  private async sendOneSignalNotification(user: User, alert: Alert) {
    try {
      const messageData = createOneSignalMessage(user, alert);

      await this.oneSignalService.sendNotification(
        [messageData.playerId],
        messageData.title,
        messageData.subtitle,
        messageData.body,
        messageData.data,
      );

      this.logger.log(
        `Successfully sent OneSignal notification to ${user.username}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending OneSignal notification: ${error.message}`,
      );
    }
  }

  // Método para enviar notificação de teste/debug
  async sendDebugNotification(debugDto: DebugNotificationDto) {
    try {
      if (!debugDto.playerId) {
        throw new Error('É necessário fornecer um playerId do OneSignal');
      }

      const title = debugDto.title || 'Notificação de teste';
      const subtitle = debugDto.subtitle || 'Debug';
      const body = debugDto.body || 'Esta é uma notificação de teste';
      const data = debugDto.data || {
        debug: true,
        timestamp: new Date().toISOString(),
      };

      // Envia a notificação diretamente para o OneSignal usando o playerId
      await this.oneSignalService.sendNotification(
        [debugDto.playerId],
        title,
        subtitle,
        body,
        data,
      );

      return {
        success: true,
        message: `Notificação de teste enviada para o dispositivo com playerId: ${debugDto.playerId}`,
        notificationDetails: {
          title,
          subtitle,
          body,
          data,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de debug: ${error.message}`,
      );
      throw error;
    }
  }

  @Cron('*/60 * * * * *')
  async verifyAlerts() {
    this.logger.log('Checking alerts 🔎🔎🔎');
    const now = new Date();

    const alerts = await this.prisma.alert.findMany({
      select: {
        id: true,
        title: true,
        subtitle: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            expo_token: true,
            languageTag: true,
            timeZone: true,
          },
        },
        trigger: true,
      },
    });

    this.logger.log(`${alerts.length} alerts found 🌴🌴🌴`);

    alerts.forEach(async (alert) => {
      const { trigger, user } = alert;

      const serverUserZonedTime = toZonedTime(now, user.timeZone);
      const clientUserZonedTime = toZonedTime(trigger.date, user.timeZone);

      this.logger.log(
        `CHECK ALERT: ${alert.title} | ALERT TYPE: ${trigger.alertType}  | USER: ${user.username}`,
      );
      if (trigger) {
        switch (trigger.alertType) {
          case AlertType.INTERVAL:
            {
              const lastNotification = trigger.last_alert ?? alert.createdAt;
              const differenceInMinutesBetweenDates = differenceInMinutes(
                now.setSeconds(0, 0),
                lastNotification.setSeconds(0, 0),
              );

              const intervalInMinutes = trigger.hours * 60 + trigger.minutes;

              if (differenceInMinutesBetweenDates >= intervalInMinutes) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                await this.sendOneSignalNotification(user as User, alert);

                await this.prisma.alert.update({
                  where: { id: alert.id },
                  data: {
                    trigger: {
                      update: {
                        last_alert: now,
                      },
                    },
                  },
                });
              }
            }
            break;
          case AlertType.DAILY:
            {
              if (
                isSameHour(clientUserZonedTime, serverUserZonedTime) &&
                isSameMinute(clientUserZonedTime, serverUserZonedTime)
              ) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                await this.sendOneSignalNotification(user as User, alert);
              }
            }
            break;
          case AlertType.WEEKLY:
            {
              const weeksToTrigger: number[] = [];

              for (const week of trigger.week) {
                weeksToTrigger.push(dayOfWeekToNumber(week));
              }

              const isAlerDay = isAlertDay(weeksToTrigger, serverUserZonedTime);

              if (!isAlerDay) return;

              if (
                isSameHour(clientUserZonedTime, serverUserZonedTime) &&
                isSameMinute(clientUserZonedTime, serverUserZonedTime)
              ) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                await this.sendOneSignalNotification(user as User, alert);
              }
            }
            break;
          case AlertType.DATE:
            {
              if (
                isToday(trigger.date) &&
                isSameHour(clientUserZonedTime, serverUserZonedTime) &&
                isSameMinute(clientUserZonedTime, serverUserZonedTime)
              ) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                await this.sendOneSignalNotification(user as User, alert);
              }
            }
            break;
        }
      }
    });
  }
}
