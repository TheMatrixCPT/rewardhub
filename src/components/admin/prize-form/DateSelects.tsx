
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDateParts, getDaysInMonth } from "@/utils/dateUtils";

interface DateSelectsProps {
  fieldName: 'registration_start' | 'registration_end' | 'deadline';
  label: string;
  value: string;
  onDateChange: (type: 'registration_start' | 'registration_end' | 'deadline', field: 'year' | 'month' | 'day', value: string) => void;
}

const DateSelects = ({ fieldName, label, value, onDateChange }: DateSelectsProps) => {
  const date = value ? new Date(value) : new Date();
  const daysInMonth = getDaysInMonth(date);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dateParts = getDateParts(value);
  
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i, 1), 'MMMM')
  }));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">{label} *</label>
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={dateParts.year.toString()}
          onValueChange={(value) => onDateChange(fieldName, 'year', value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateParts.month.toString()}
          onValueChange={(value) => onDateChange(fieldName, 'month', value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateParts.day.toString()}
          onValueChange={(value) => onDateChange(fieldName, 'day', value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DateSelects;
