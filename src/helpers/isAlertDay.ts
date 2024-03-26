export const isAlertDay = (weeks: number[], zonedDate: Date) => {
  const week = zonedDate.getDay();
  return !!weeks.find((weekday) => weekday == week);
};
