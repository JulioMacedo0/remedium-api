import { ExpoPushMessage } from 'expo-server-sdk';

export const createExpoMessage = (
  user: {
    username: string;
    email: string;
    expo_token: string;
  },
  alert: {
    id: string;
    title: string;
    subtitle: string;
    body: string;
    createdAt: Date;
  },
): ExpoPushMessage => {
  return {
    to: user.expo_token,
    title: alert.title,
    subtitle: alert.subtitle,
    sound: 'default',
    body: `${alert.body}`,
    data: { subttile: alert.subtitle },
  };
};
