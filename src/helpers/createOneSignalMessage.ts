export const createOneSignalMessage = (
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
): {
  playerId: string;
  title: string;
  subtitle: string;
  body: string;
  data: any;
} => {
  return {
    playerId: user.expo_token,
    title: alert.title,
    subtitle: alert.subtitle,
    body: alert.body,
    data: {
      alertId: alert.id,
      createdAt: alert.createdAt,
    },
  };
};
