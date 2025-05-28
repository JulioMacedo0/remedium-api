export const getUserDate = (user: {
  username: string;
  email: string;
  expo_token: string;
  languageTag: string;
  timeZone: string;
}): Date => {
  const currentTime = new Date();
  const currentTimeInTimeZone = new Date(
    currentTime.toLocaleString(user.languageTag, {
      timeZone: user.timeZone,
    }),
  );
  return currentTimeInTimeZone;
};
