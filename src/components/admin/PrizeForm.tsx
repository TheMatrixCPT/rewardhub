import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type Prize = Tables<"prizes">

interface PrizeFormProps {
  onPrizeAdded: () => void;
}

const PrizeForm = ({ onPrizeAdded }: PrizeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: "",
    description: "",
    points_required: "",
    image_url: "",
    deadline: "",
    registration_start: "",
    registration_end: "",
  });

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

      setNewPrize(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newPrize.name || !newPrize.points_required || !newPrize.registration_start || 
        !newPrize.registration_end || !newPrize.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('prizes')
        .insert([
          {
            ...newPrize,
            points_required: parseInt(newPrize.points_required),
            deadline: newPrize.deadline ? new Date(newPrize.deadline).toISOString() : null,
            registration_start: newPrize.registration_start ? new Date(newPrize.registration_start).toISOString() : null,
            registration_end: newPrize.registration_end ? new Date(newPrize.registration_end).toISOString() : null,
          },
        ]);

      if (error) throw error;

      toast.success("Prize added successfully!");
      setNewPrize({
        name: "",
        description: "",
        points_required: "",
        image_url: "",
        deadline: "",
        registration_start: "",
        registration_end: "",
      });
      onPrizeAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-muted/50">
      <h2 className="text-2xl font-semibold mb-2">Add New Prize</h2>
      <p className="text-muted-foreground mb-6">Create a new prize for users to compete for</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Prize Name *</label>
          <Input
            required
            value={newPrize.name}
            onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
            placeholder="Enter prize name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={newPrize.description}
            onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
            placeholder="Describe the prize"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Points Required *</label>
          <Input
            required
            type="number"
            value={newPrize.points_required}
            onChange={(e) => setNewPrize({ ...newPrize, points_required: e.target.value })}
            placeholder="Enter required points"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration Start *</label>
          <Input
            required
            type="datetime-local"
            value={newPrize.registration_start}
            onChange={(e) => setNewPrize({ ...newPrize, registration_start: e.target.value })}
            placeholder="Set registration start date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration End *</label>
          <Input
            required
            type="datetime-local"
            value={newPrize.registration_end}
            onChange={(e) => setNewPrize({ ...newPrize, registration_end: e.target.value })}
            placeholder="Set registration end date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Competition Deadline *</label>
          <Input
            required
            type="datetime-local"
            value={newPrize.deadline}
            onChange={(e) => setNewPrize({ ...newPrize, deadline: e.target.value })}
            placeholder="Set competition deadline"
          />
        </div>

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
            {newPrize.image_url && (
              <img
                src={newPrize.image_url}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading || uploadingImage} className="w-full">
            {loading ? "Adding..." : "Add Prize"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PrizeForm;
