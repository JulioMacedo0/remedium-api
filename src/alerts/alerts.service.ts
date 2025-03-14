import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
import { ExpoPushMessage } from 'expo-server-sdk';
import { isAlertDay } from 'src/helpers/isAlertDay';
import { dayOfWeekToNumber } from 'src/helpers/dayOfWeekToNumber';
import { sendPushMessages } from 'src/helpers/sendPushMessages';
import { createExpoMessage } from 'src/helpers/createExpoMessage';
import { AlertType } from '@prisma/client';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  constructor(private prisma: PrismaService) {}
  create(id: string, createAlertDto: CreateAlertDto) {
    return this.prisma.alert.create({
      data: {
        title: createAlertDto.title,
        body: createAlertDto.body,
        subtitle: createAlertDto.subtitle,
        // unit_of_measurement: createAlertDto.unit_of_measurement,
        trigger: {
          create: { ...createAlertDto.trigger, last_alert: new Date() },
        },
        user: {
          connect: { id },
        },
        // medicine: {
        //   connect: { id: createAlertDto.medicine_id },
        // },
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
        // medicine: true,
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

  @Cron('*/60 * * * * *')
  async verifyAlerts() {
    this.logger.log('Checking alerts 🔎🔎🔎');
    const now = new Date();

    const alerts = await this.prisma.alert.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        subtitle: true,
        // unit_of_measurement: true,
        createdAt: true,
        user: {
          select: {
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

      if (!user.expo_token) {
        this.logger.error(`User ${user.username} dont have token`);
        return;
      }

      this.logger.log(
        `CHECK ALERT: ${alert.title} | ALERT TYPE: ${trigger.alertType}  | USER: ${user.username}`,
      );
      if (trigger) {
        switch (trigger.alertType) {
          case AlertType.INTERVAL:
            {
              const messages = [];
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

                messages.push(createExpoMessage(user, alert));
                sendPushMessages(messages, this.logger);

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
              const messages = [];

              if (
                isSameHour(clientUserZonedTime, serverUserZonedTime) &&
                isSameMinute(clientUserZonedTime, serverUserZonedTime)
              ) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                messages.push(createExpoMessage(user, alert));
                sendPushMessages(messages, this.logger);
              }
            }
            break;
          case AlertType.WEEKLY:
            {
              const messages = [];
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

                messages.push(createExpoMessage(user, alert));
                sendPushMessages(messages, this.logger);
              }
            }
            break;
          case AlertType.DATE:
            {
              const messages: ExpoPushMessage[] = [];

              if (
                isToday(trigger.date) &&
                isSameHour(clientUserZonedTime, serverUserZonedTime) &&
                isSameMinute(clientUserZonedTime, serverUserZonedTime)
              ) {
                this.logger.debug(
                  `SENDING ALERT: ${alert.title} TO USER ${user.username}`,
                );

                messages.push(createExpoMessage(user, alert));
                sendPushMessages(messages, this.logger);
              }
            }
            break;
        }
      }
    });
  }
}
