import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfessionalInfoProps {
  profile: {
    company: string;
    job_title: string;
    bio: string;
    linkedin_profile: string;
    referral_source: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export const ProfessionalInfo = ({ profile, isEditing, onChange }: ProfessionalInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Company</Label>
          <Input
            value={profile.company}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder="Your company name"
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input
            value={profile.job_title}
            onChange={(e) => onChange('job_title', e.target.value)}
            placeholder="Your job title"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={profile.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label>LinkedIn Profile</Label>
        <Input
          type="url"
          value={profile.linkedin_profile}
          onChange={(e) => onChange('linkedin_profile', e.target.value)}
          placeholder="https://linkedin.com/in/username"
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label>How did you hear about us?</Label>
        <Input
          value={profile.referral_source}
          onChange={(e) => onChange('referral_source', e.target.value)}
          placeholder="Enter referral source"
          disabled={!isEditing}
        />
      </div>
    </div>
  );
};