import { Alert, User } from '@prisma/client';

export const createOneSignalMessage = (
  user: User,
  alert: Alert,
): {
  playerId: string;
  title: string;
  subtitle: string;
  body: string;
  data: any;
} => {
  return {
    playerId: user.id,
    title: alert.title,
    subtitle: alert.subtitle,
    body: alert.body,
    data: {
      alertId: alert.id,
      createdAt: alert.createdAt,
    },
  };
};
