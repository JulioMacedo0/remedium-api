import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DefaultApi,
  Notification,
  createConfiguration,
} from '@onesignal/node-onesignal';

@Injectable()
export class OneSignalService {
  private oneSignalClient: DefaultApi;
  private readonly logger = new Logger(OneSignalService.name);
  private appId: string;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.configService.get<string>('ONESIGNAL_API_KEY');
    this.logger.log('Initializing OneSignal service');

    if (!appId || !apiKey) {
      this.logger.error('OneSignal credentials are not configured!');
      return;
    }

    this.appId = appId;
    this.logger.log('OneSignal credentials loaded successfully!');

    const configuration = createConfiguration({
      restApiKey: apiKey,
    });

    this.oneSignalClient = new DefaultApi(configuration);
  }

  async sendNotification(
    playerIds: string[],
    title: string,
    subtitle: string,
    body: string,
    data: any = {},
  ): Promise<void> {
    try {
      if (!playerIds.length || !this.oneSignalClient) {
        this.logger.warn(
          'No player IDs provided or OneSignal client not initialized',
        );
        return;
      }

      const notificationRequest: Notification = {
        app_id: this.appId,

        include_aliases: {
          external_id: playerIds,
        },
        target_channel: 'push',
        headings: { en: title },
        subtitle: { en: subtitle },
        contents: { en: body },
        data: data,
      };

      const result =
        await this.oneSignalClient.createNotification(notificationRequest);
      this.logger.log(`Successfully sent notification: ${result.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send OneSignal notification: ${error.message}`,
      );
      throw error;
    }
  }
}
