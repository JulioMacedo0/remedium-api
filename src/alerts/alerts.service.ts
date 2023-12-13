import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AlertType } from '@prisma/client';
//import { Cron } from '@nestjs/schedule';

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
      },
      include: {
        trigger: true,
      },
    });
  }

  findAll(id: string) {
    return this.prisma.alert.findMany({
      where: { userId: id },
      include: {
        trigger: true,
      },
    });
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
  @Cron('*/60 * * * * *')
  async verifyAlerts() {
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
            email: true,
            expo_token: true,
          },
        },
        trigger: true,
      },
    });
    for (const alert of alerts) {
      const { trigger, user } = alert;

      if (trigger) {
        switch (trigger.type) {
          case AlertType.INTERVAL:
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
                `enviando notificação de ${user.email} alert: ${alert.title}`,
              );

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
            break;
        }
      }
    }
  }
}
