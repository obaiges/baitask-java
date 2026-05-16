export interface ScheduleEvent {
  id: number;
  userId: number;
  username: string;
  title: string;
  description: string;
  eventDate: string;
  displayDate: string;
  startTime: string | null;
  endTime: string | null;
  color: string;
  recurring: boolean;
  recurringType: string | null;
  recurringEndDate: string | null;
}

export interface CreateScheduleEventRequest {
  title: string;
  description?: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  color?: string;
  recurring?: boolean;
  recurringType?: string;
  recurringEndDate?: string | null;
}

export const RECURRING_TYPES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export const EVENT_COLORS = [
  '#667eea', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#6366f1',
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0') + ':00'
);
