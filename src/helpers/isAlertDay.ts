export const isAlertDay = (weeks: number[]) => {
  const date = new Date();
  const week = date.getDay();
  return !!weeks.find((weekday) => weekday == week);
};
