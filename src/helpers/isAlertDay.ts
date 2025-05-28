export const isAlertDay = (weeks: number[], zonedDate: Date): boolean => {
  const week = zonedDate.getDay();
  return !!weeks.find((weekday) => weekday == week);
};
