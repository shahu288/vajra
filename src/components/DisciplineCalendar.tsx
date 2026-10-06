import React from 'react';
import { VajraStreakCalendar, VajraStreakCalendarProps } from './VajraStreakCalendar';

export type DayStatus = 'completed' | 'broken' | 'partial' | 'empty' | 'future';

export { VajraStreakCalendar };
export type { VajraStreakCalendarProps };

export function DisciplineCalendar(props: VajraStreakCalendarProps) {
  return <VajraStreakCalendar {...props} />;
}

export default DisciplineCalendar;
