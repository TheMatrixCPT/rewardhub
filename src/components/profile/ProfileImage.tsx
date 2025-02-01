import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ProfileImageProps {
  avatarUrl: string;
  isEditing: boolean;
  uploadingImage: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileImage = ({
  avatarUrl,
  isEditing,
  uploadingImage,
  onImageUpload,
}: ProfileImageProps) => {
  return (
    <div className="space-y-2">
      <Label>Profile Picture</Label>
      <div className="space-y-2">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
        )}
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            disabled={uploadingImage || !isEditing}
            className="hidden"
            id="profile-picture"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('profile-picture')?.click()}
            disabled={uploadingImage || !isEditing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadingImage ? 'Uploading...' : 'Upload Picture'}
          </Button>
        </div>
      </div>
    </div>
  );
};