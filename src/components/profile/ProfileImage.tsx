import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { toast } from "sonner";

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
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('Please select an image to upload.');
        return;
      }
      onImageUpload(event);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Profile Picture</Label>
      <div className="space-y-2">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />
        )}
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
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