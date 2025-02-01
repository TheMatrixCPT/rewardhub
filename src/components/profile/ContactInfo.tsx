import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactInfoProps {
  profile: {
    phone_number: string;
    address: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export const ContactInfo = ({ profile, isEditing, onChange }: ContactInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input
          type="tel"
          value={profile.phone_number}
          onChange={(e) => onChange('phone_number', e.target.value)}
          placeholder="Enter your phone number"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea
          value={profile.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Enter your address"
          className="min-h-[80px]"
          disabled={!isEditing}
        />
      </div>
    </div>
  );
};