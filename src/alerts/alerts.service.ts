import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AlertType } from '@prisma/client';
//import { Cron } from '@nestjs/schedule';
import { Expo } from 'expo-server-sdk';
import { isAlertDay } from 'src/helpers/isAlertDay';
import { dayOfWeekToNumber } from 'src/helpers/dayOfWeekToNumber';
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
        unit_of_measurement: createAlertDto.unit_of_measurement,
        trigger: {
          create: { ...createAlertDto.trigger, last_alert: new Date() },
        },
        user: {
          connect: { id },
        },
        medicine: {
          connect: { id: createAlertDto.medicine_id },
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
  @Cron('*/5 * * * * *')
  async verifyAlerts() {
    this.logger.log('Checking alerts 🔎🔎🔎');
    const alerts = await this.prisma.alert.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        subtitle: true,
        unit_of_measurement: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            email: true,
            expo_token: true,
          },
        },
        trigger: true,
      },
    });

    this.logger.log(`${alerts.length} alerts found 🌴🌴🌴`);

    const expo = new Expo();

    for (const alert of alerts) {
      const { trigger, user } = alert;

      if (!user.expo_token.length) {
        this.logger.error(`User ${user.username} dont have token`);
        return;
      }

      this.logger.log(`checking ${alert.title} is time to send `);
      if (trigger) {
        switch (trigger.type) {
          case AlertType.INTERVAL:
            {
              const messages = [];
              const lastNotification = trigger.last_alert ?? alert.createdAt;
              const currentTime = new Date();
              const timeSinceLastNotification =
                currentTime.getTime() - lastNotification.getTime();
              const intervalInMilliseconds =
                trigger.hours * 60 * 60 * 1000 +
                trigger.minutes * 60 * 1000 +
                trigger.seconds * 1000;

              if (timeSinceLastNotification >= intervalInMilliseconds) {
                this.logger.debug(
                  `Sedding notification. Type:${AlertType.DAILY} Title:${alert.title}`,
                );

                messages.push({
                  to: user.expo_token[0],
                  title: alert.title,
                  subtitle: alert.subtitle,
                  sound: 'default',
                  body: `${alert.body} alertID:${alert.id}`,
                  data: { subttile: alert.subtitle },
                });
                const chunks = expo.chunkPushNotifications(messages);

                for (const chunk of chunks) {
                  try {
                    const ticketChunk =
                      await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);

                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                  } catch (error) {
                    console.error(error);
                  }
                }
                await this.prisma.alert.update({
                  where: { id: alert.id },
                  data: {
                    trigger: {
                      update: {
                        last_alert: currentTime,
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
              const currentTime = new Date();
              const hour = currentTime.getHours();
              const minute = currentTime.getMinutes();

              if (hour === trigger.hours && minute === trigger.minutes) {
                this.logger.debug(
                  `Sedding notification. Type:${AlertType.DAILY} Title:${alert.title}`,
                );

                messages.push({
                  to: user.expo_token[0],
                  title: alert.title,
                  subtitle: alert.subtitle,
                  sound: 'default',
                  body: `${alert.body} alertID:${alert.id}`,
                  data: { subttile: alert.subtitle },
                });
                const chunks = expo.chunkPushNotifications(messages);

                for (const chunk of chunks) {
                  try {
                    const ticketChunk =
                      await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);

                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                  } catch (error) {
                    console.error(error);
                  }
                }
              }
            }
            break;
          case AlertType.WEEKLY: {
            const messages = [];
            const weeksToTrigger: number[] = [];
            for (const week of trigger.week) {
              weeksToTrigger.push(dayOfWeekToNumber(week));
            }

            const isAlerDay = isAlertDay(weeksToTrigger);

            if (!isAlerDay) return;

            const currentTime = new Date();
            const hour = currentTime.getHours();
            const minute = currentTime.getMinutes();
            console.log('hour', hour);
            console.log('minute', minute);
            if (hour === trigger.hours && minute === trigger.minutes) {
              this.logger.debug(
                `Sedding notification. Type:${AlertType.WEEKLY} Title:${alert.title}`,
              );

              messages.push({
                to: user.expo_token[0],
                title: alert.title,
                subtitle: alert.subtitle,
                sound: 'default',
                body: `${alert.body} alertID:${alert.id}`,
                data: { subttile: alert.subtitle },
              });
              const chunks = expo.chunkPushNotifications(messages);

              for (const chunk of chunks) {
                try {
                  const ticketChunk =
                    await expo.sendPushNotificationsAsync(chunk);
                  console.log(ticketChunk);

                  // NOTE: If a ticket contains an error code in ticket.details.error, you
                  // must handle it appropriately. The error codes are listed in the Expo
                  // documentation:
                  // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                } catch (error) {
                  console.error(error);
                }
              }
            }
          }
        }
      }
    }
  }
}
