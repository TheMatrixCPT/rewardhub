import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PersonalInfoProps {
  profile: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export const PersonalInfo = ({ profile, isEditing, onChange }: PersonalInfoProps) => {
  const handleDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    const date = profile.date_of_birth ? new Date(profile.date_of_birth) : new Date();
    
    switch (type) {
      case 'year':
        date.setFullYear(parseInt(value));
        break;
      case 'month':
        date.setMonth(parseInt(value));
        break;
      case 'day':
        date.setDate(parseInt(value));
        break;
    }
    
    onChange('date_of_birth', date.toISOString().split('T')[0]);
  };

  const currentDate = profile.date_of_birth ? new Date(profile.date_of_birth) : new Date();
  const years = Array.from({ length: new Date().getFullYear() - 1940 + 1 }, (_, i) => 1940 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i, 1), 'MMMM')
  }));
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input
          value={profile.first_name || ""}
          onChange={(e) => onChange('first_name', e.target.value)}
          placeholder="Enter your first name"
          disabled={!isEditing}
          className={cn(!isEditing && "bg-muted")}
        />
      </div>

      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input
          value={profile.last_name || ""}
          onChange={(e) => onChange('last_name', e.target.value)}
          placeholder="Enter your last name"
          disabled={!isEditing}
          className={cn(!isEditing && "bg-muted")}
        />
      </div>

      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={currentDate.getFullYear().toString()}
            onValueChange={(value) => handleDateChange('year', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className={cn(!isEditing && "bg-muted")}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.reverse().map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentDate.getMonth().toString()}
            onValueChange={(value) => handleDateChange('month', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className={cn(!isEditing && "bg-muted")}>
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
            value={currentDate.getDate().toString()}
            onValueChange={(value) => handleDateChange('day', value)}
            disabled={!isEditing}
          >
            <SelectTrigger className={cn(!isEditing && "bg-muted")}>
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

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select 
          value={profile.gender || ""} 
          onValueChange={(value) => onChange('gender', value)}
          disabled={!isEditing}
        >
          <SelectTrigger className={cn(!isEditing && "bg-muted")}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};