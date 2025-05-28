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

import { differenceInMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { isAlertDay } from 'src/helpers/isAlertDay';
import { dayOfWeekToNumber } from 'src/helpers/dayOfWeekToNumber';
import { createOneSignalMessage } from 'src/helpers/createOneSignalMessage';
import { Alert, AlertType, Trigger, User } from '@prisma/client';
import { OneSignalService } from 'src/onesignal/onesignal.service';
import { DebugNotificationDto } from './dto/debug-notification.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  constructor(
    private prisma: PrismaService,
    private oneSignalService: OneSignalService,
  ) {}

  create(id: string, createAlertDto: CreateAlertDto): Promise<any> {
    this.logger.log(
      `Creating new alert "${createAlertDto.title}" for user ${id} with type ${createAlertDto.trigger.alertType}`,
    );
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

  async findAll(id: string): Promise<Alert[]> {
    this.logger.debug(`Fetching all alerts for user ${id}`);
    const alerts = await this.prisma.alert.findMany({
      where: { userId: id },
      include: {
        trigger: true,
      },
    });
    this.logger.debug(`Found ${alerts.length} alerts for user ${id}`);
    return alerts;
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<Alert & { trigger: Trigger; user: User }> {
    this.logger.debug(`Fetching alert ${id} for user ${userId}`);
    const alert = await this.prisma.alert.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        trigger: true,
        user: true,
      },
    });

    if (alert.userId != userId) {
      this.logger.warn(
        `Unauthorized access attempt: User ${userId} trying to access alert ${id} owned by ${alert.userId}`,
      );
      throw new UnauthorizedException();
    }

    return alert;
  }

  async update(
    id: string,
    updateAlertDto: UpdateAlertDto,
    userId: string,
  ): Promise<Alert & { trigger: Trigger }> {
    this.logger.log(`Updating alert ${id} for user ${userId}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateAlertDto)}`);

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

    if (alert.userId != userId) {
      this.logger.warn(
        `Unauthorized access attempt: User ${userId} trying to update alert ${id} owned by ${alert.userId}`,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(`Alert ${id} successfully updated`);
    return alert;
  }

  async remove(id: string, userId: string): Promise<Alert> {
    this.logger.log(`Deleting alert ${id} for user ${userId}`);

    const alert = await this.prisma.alert.delete({
      where: { id },
    });

    if (alert.userId != userId) {
      this.logger.warn(
        `Unauthorized access attempt: User ${userId} trying to delete alert ${id} owned by ${alert.userId}`,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(`Alert ${id} successfully deleted`);
    return alert;
  }

  private async sendOneSignalNotification(
    user: User,
    alert: Alert,
  ): Promise<void> {
    try {
      this.logger.log(
        `🔔 SENDING NOTIFICATION: "${alert.title}" to ${user.username} (ID: ${user.id})`,
      );
      const messageData = createOneSignalMessage(user, alert);

      await this.oneSignalService.sendNotification(
        [messageData.playerId],
        messageData.title,
        messageData.subtitle,
        messageData.body,
        messageData.data,
      );

      this.logger.log(
        `✅ NOTIFICATION SENT: "${alert.title}" to ${user.username} (ID: ${user.id})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ NOTIFICATION FAILED: "${alert.title}" to ${user.username} (ID: ${user.id}) - Error: ${error.message}`,
      );
    }
  }

  async sendDebugNotification(debugDto: DebugNotificationDto): Promise<{
    success: boolean;
    message: string;
    notificationDetails: {
      title: string;
      subtitle: string;
      body: string;
      data: any;
    };
  }> {
    try {
      if (!debugDto.playerId) {
        this.logger.warn(`Debug notification failed: No player ID provided`);
        throw new Error('A OneSignal player ID is required');
      }

      const title = debugDto.title || 'Test notification';
      const subtitle = debugDto.subtitle || 'Debug';
      const body = debugDto.body || 'This is a test notification';
      const data = debugDto.data || {
        debug: true,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(
        `Sending debug notification to player ID: ${debugDto.playerId}`,
      );
      this.logger.debug(
        `Debug notification content: ${JSON.stringify({
          title,
          subtitle,
          body,
          data,
        })}`,
      );

      await this.oneSignalService.sendNotification(
        [debugDto.playerId],
        title,
        subtitle,
        body,
        data,
      );

      this.logger.log(
        `Debug notification successfully sent to player ID: ${debugDto.playerId}`,
      );

      return {
        success: true,
        message: `Test notification sent to device with playerId: ${debugDto.playerId}`,
        notificationDetails: {
          title,
          subtitle,
          body,
          data,
        },
      };
    } catch (error) {
      this.logger.error(`Error sending debug notification: ${error.message}`);
      throw error;
    }
  }

  @Cron('0 * * * * *')
  async verifyAlerts(): Promise<void> {
    const startTime = new Date();
    this.logger.log(
      `[ALERT CHECK] Starting alert verification cycle at ${format(
        startTime,
        'yyyy-MM-dd HH:mm:ss',
      )}`,
    );
    const now = new Date();
    now.setSeconds(0, 0);

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

    this.logger.log(`[ALERT CHECK] Found ${alerts.length} alerts to process`);

    let processedCount = 0;
    let triggeredCount = 0;
    let errorCount = 0;

    for (const alert of alerts) {
      const { trigger, user } = alert;
      processedCount++;

      if (!trigger) {
        this.logger.warn(
          `[ALERT ID:${alert.id}] No trigger configuration found - SKIPPING`,
        );
        continue;
      }

      this.logger.debug(
        `[ALERT CHECK] [${processedCount}/${alerts.length}] Processing alert "${alert.title}" (ID:${alert.id}) | TYPE:${trigger.alertType} | USER:${user.username}`,
      );

      try {
        const serverUserZonedTime = toZonedTime(now, user.timeZone);
        const userTimeFormatted = format(
          serverUserZonedTime,
          'yyyy-MM-dd HH:mm:ss',
        );

        this.logger.debug(
          `[ALERT ID:${alert.id}] User time: ${userTimeFormatted} (${user.timeZone})`,
        );

        let wasTriggered = false;
        switch (trigger.alertType) {
          case AlertType.INTERVAL:
            wasTriggered = await this.handleIntervalAlert(
              alert,
              trigger,
              user as User,
              now,
            );
            break;

          case AlertType.DAILY:
            wasTriggered = await this.handleDailyAlert(
              alert,
              trigger,
              user as User,
              serverUserZonedTime,
            );
            break;

          case AlertType.WEEKLY:
            wasTriggered = await this.handleWeeklyAlert(
              alert,
              trigger,
              user as User,
              serverUserZonedTime,
            );
            break;

          case AlertType.DATE:
            wasTriggered = await this.handleDateAlert(
              alert,
              trigger,
              user as User,
              serverUserZonedTime,
            );
            break;

          default:
            this.logger.warn(
              `[ALERT ID:${alert.id}] Unknown alert type: ${trigger.alertType}`,
            );
        }

        if (wasTriggered) {
          triggeredCount++;
        }
      } catch (error) {
        errorCount++;
        this.logger.error(
          `[ALERT ID:${alert.id}] Error processing alert: ${error.message}`,
        );
      }
    }

    const endTime = new Date();
    const processingTime = endTime.getTime() - startTime.getTime();

    this.logger.log(
      `[ALERT CHECK] Completed alert verification cycle. Processed: ${processedCount}, Triggered: ${triggeredCount}, Errors: ${errorCount}, Time: ${processingTime}ms`,
    );
  }

  private async handleIntervalAlert(
    alert: Alert,
    trigger: Trigger,
    user: User,
    now: Date,
  ): Promise<boolean> {
    const lastNotification = trigger.last_alert ?? alert.createdAt;

    const currentTime = new Date(now);
    const lastAlertTime = new Date(lastNotification);

    currentTime.setSeconds(0, 0);
    lastAlertTime.setSeconds(0, 0);

    const differenceInMinutesBetweenDates = differenceInMinutes(
      currentTime,
      lastAlertTime,
    );
    const intervalInMinutes = trigger.hours * 60 + trigger.minutes;

    const lastTimeFormatted = format(lastAlertTime, 'yyyy-MM-dd HH:mm:ss');
    const currentFormatted = format(currentTime, 'yyyy-MM-dd HH:mm:ss');

    this.logger.debug(
      `[INTERVAL ALERT ID:${alert.id}] Last alert: ${lastTimeFormatted}, Current time: ${currentFormatted}, Time passed: ${differenceInMinutesBetweenDates} minutes, Interval: ${intervalInMinutes} minutes (${trigger.hours}h ${trigger.minutes}m)`,
    );

    if (differenceInMinutesBetweenDates >= intervalInMinutes) {
      this.logger.log(
        `[INTERVAL ALERT ID:${alert.id}] ⏰ TRIGGERED "${alert.title}" for ${user.username} - Time passed: ${differenceInMinutesBetweenDates}/${intervalInMinutes} minutes`,
      );
      await this.sendOneSignalNotification(user, alert);

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
      this.logger.debug(
        `[INTERVAL ALERT ID:${alert.id}] Updated last_alert time to ${format(
          now,
          'yyyy-MM-dd HH:mm:ss',
        )}`,
      );
      return true;
    } else {
      this.logger.debug(
        `[INTERVAL ALERT ID:${alert.id}] Not triggered - Need ${intervalInMinutes - differenceInMinutesBetweenDates} more minutes`,
      );
      return false;
    }
  }

  private async handleDailyAlert(
    alert: Alert,
    trigger: Trigger,
    user: User,
    userZonedTime: Date,
  ): Promise<boolean> {
    if (!trigger.date) {
      this.logger.warn(
        `[DAILY ALERT ID:${alert.id}] No date configured - SKIPPING`,
      );
      return false;
    }

    const targetTime = toZonedTime(trigger.date, user.timeZone);

    const userTimeFormatted = format(userZonedTime, 'HH:mm');
    const targetTimeFormatted = format(targetTime, 'HH:mm');

    this.logger.debug(
      `[DAILY ALERT ID:${alert.id}] Current time: ${userTimeFormatted}, Target time: ${targetTimeFormatted}`,
    );

    if (
      targetTime.getHours() === userZonedTime.getHours() &&
      targetTime.getMinutes() === userZonedTime.getMinutes()
    ) {
      this.logger.log(
        `[DAILY ALERT ID:${alert.id}] ⏰ TRIGGERED "${alert.title}" for ${user.username} at ${userTimeFormatted}`,
      );
      await this.sendOneSignalNotification(user, alert);
      return true;
    } else {
      this.logger.debug(
        `[DAILY ALERT ID:${alert.id}] Not triggered - Current time ${userTimeFormatted} doesn't match target time ${targetTimeFormatted}`,
      );
      return false;
    }
  }

  private async handleWeeklyAlert(
    alert: Alert,
    trigger: Trigger,
    user: User,
    userZonedTime: Date,
  ): Promise<boolean> {
    if (!trigger.date || !trigger.week || !trigger.week.length) {
      this.logger.warn(
        `[WEEKLY ALERT ID:${alert.id}] Incomplete configuration - SKIPPING`,
      );
      return false;
    }

    const weeksToTrigger: number[] = trigger.week.map(dayOfWeekToNumber);

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDayOfWeek = userZonedTime.getDay();
    const currentDayName = dayNames[currentDayOfWeek];
    const configuredDays = weeksToTrigger
      .map((day) => dayNames[day])
      .join(', ');

    this.logger.debug(
      `[WEEKLY ALERT ID:${alert.id}] Current day: ${currentDayName} (${currentDayOfWeek}), Configured days: [${configuredDays}] (${weeksToTrigger.join(', ')})`,
    );

    const isAlertDayToday = isAlertDay(weeksToTrigger, userZonedTime);

    if (!isAlertDayToday) {
      this.logger.debug(
        `[WEEKLY ALERT ID:${alert.id}] Not triggered - Today (${currentDayName}) is not in configured days [${configuredDays}]`,
      );
      return false;
    }

    const targetTime = toZonedTime(trigger.date, user.timeZone);

    const userTimeFormatted = format(userZonedTime, 'HH:mm');
    const targetTimeFormatted = format(targetTime, 'HH:mm');

    this.logger.debug(
      `[WEEKLY ALERT ID:${alert.id}] Current time: ${userTimeFormatted}, Target time: ${targetTimeFormatted} on ${currentDayName}`,
    );

    if (
      targetTime.getHours() === userZonedTime.getHours() &&
      targetTime.getMinutes() === userZonedTime.getMinutes()
    ) {
      this.logger.log(
        `[WEEKLY ALERT ID:${alert.id}] ⏰ TRIGGERED "${alert.title}" for ${user.username} at ${userTimeFormatted} on ${currentDayName}`,
      );
      await this.sendOneSignalNotification(user, alert);
      return true;
    } else {
      this.logger.debug(
        `[WEEKLY ALERT ID:${alert.id}] Not triggered - Right day (${currentDayName}) but time ${userTimeFormatted} doesn't match target ${targetTimeFormatted}`,
      );
      return false;
    }
  }

  private async handleDateAlert(
    alert: Alert,
    trigger: Trigger,
    user: User,
    userZonedTime: Date,
  ): Promise<boolean> {
    if (!trigger.date) {
      this.logger.warn(
        `[DATE ALERT ID:${alert.id}] No date configured - SKIPPING`,
      );
      return false;
    }

    const targetDate = toZonedTime(trigger.date, user.timeZone);

    const userDateTimeFormatted = format(userZonedTime, 'yyyy-MM-dd HH:mm');
    const targetDateTimeFormatted = format(targetDate, 'yyyy-MM-dd HH:mm');

    this.logger.debug(
      `[DATE ALERT ID:${alert.id}] Current date/time: ${userDateTimeFormatted}, Target date/time: ${targetDateTimeFormatted}`,
    );

    const dateMatches =
      targetDate.getFullYear() === userZonedTime.getFullYear() &&
      targetDate.getMonth() === userZonedTime.getMonth() &&
      targetDate.getDate() === userZonedTime.getDate();

    const timeMatches =
      targetDate.getHours() === userZonedTime.getHours() &&
      targetDate.getMinutes() === userZonedTime.getMinutes();

    if (dateMatches && timeMatches) {
      this.logger.log(
        `[DATE ALERT ID:${alert.id}] ⏰ TRIGGERED "${alert.title}" for ${user.username} at exact date/time: ${userDateTimeFormatted}`,
      );
      await this.sendOneSignalNotification(user, alert);
      return true;
    } else {
      if (!dateMatches) {
        this.logger.debug(
          `[DATE ALERT ID:${alert.id}] Not triggered - Current date doesn't match target date`,
        );
      } else {
        this.logger.debug(
          `[DATE ALERT ID:${alert.id}] Not triggered - Date matches but time doesn't match`,
        );
      }
      return false;
    }
  }
}
