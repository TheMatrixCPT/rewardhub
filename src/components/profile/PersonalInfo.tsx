import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input
          value={profile.first_name}
          onChange={(e) => onChange('first_name', e.target.value)}
          placeholder="Enter your first name"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input
          value={profile.last_name}
          onChange={(e) => onChange('last_name', e.target.value)}
          placeholder="Enter your last name"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !profile.date_of_birth && "text-muted-foreground"
              )}
              disabled={!isEditing}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {profile.date_of_birth ? format(new Date(profile.date_of_birth), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={profile.date_of_birth ? new Date(profile.date_of_birth) : undefined}
              onSelect={(date) => onChange('date_of_birth', date ? date.toISOString().split('T')[0] : "")}
              initialFocus
              disabled={!isEditing}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <Select 
          value={profile.gender} 
          onValueChange={(value) => onChange('gender', value)}
          disabled={!isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};