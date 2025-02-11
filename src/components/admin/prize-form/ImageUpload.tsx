
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  imageUrl: string;
  onImageUploaded: (url: string) => void;
}

const ImageUpload = ({ imageUrl, onImageUploaded }: ImageUploadProps) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `prizes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Prize Image</label>
      <div className="flex gap-4 items-start">
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploadingImage}
          className="flex-1"
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-20 h-20 object-cover rounded"
          />
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
