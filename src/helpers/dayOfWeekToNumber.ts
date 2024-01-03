import { DayOfWeek } from '@prisma/client';

export const dayOfWeekToNumber = (day: DayOfWeek): number => {
  switch (day) {
    case 'SUNDAY':
      return 0;
    case 'MONDAY':
      return 1;
    case 'TUESDAY':
      return 2;
    case 'WEDNESDAY':
      return 3;
    case 'THURSDAY':
      return 4;
    case 'FRIDAY':
      return 5;
    case 'SATURDAY':
      return 6;
    default:
      throw new Error('Invalid day of the week');
  }
};
