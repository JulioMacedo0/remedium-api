import { Logger } from '@nestjs/common';
import { ExpoPushMessage, Expo } from 'expo-server-sdk';

export const sendPushMessages = async (
  messages: ExpoPushMessage[],
  logger: Logger,
) => {
  const expo = new Expo();

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);

      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      logger.error(error);
    }
  }
};
