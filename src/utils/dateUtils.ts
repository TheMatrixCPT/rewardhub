
import { format } from "date-fns";

export const getDateParts = (dateString: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate()
  };
};

export const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const validateDates = (
  type: 'registration_start' | 'registration_end' | 'deadline',
  dateField: Date,
  currentDates: {
    registration_start: string;
    registration_end: string;
    deadline: string;
  }
) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (dateField < now) {
    return "Cannot select a date before today";
  }

  if (type === 'registration_start') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateField.getTime() === today.getTime()) {
      return "Registration start date cannot be today's date";
    }
  }

  if (type === 'registration_end' && currentDates.registration_start) {
    const startDate = new Date(currentDates.registration_start);
    if (dateField <= startDate) {
      return "Registration end date must be after registration start date";
    }
  }

  if (type === 'deadline' && currentDates.registration_end) {
    const endDate = new Date(currentDates.registration_end);
    if (dateField <= endDate) {
      return "Competition end date must be after registration end date";
    }
  }

  return null;
};
