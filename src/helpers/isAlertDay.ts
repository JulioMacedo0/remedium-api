export const isAlertDay = (weeks: number[]) => {
  console.log('weeks', weeks);
  const date = new Date();
  const week = date.getDay();
  console.log('week', week);
  return !!weeks.find((weekday) => weekday == week);
};
