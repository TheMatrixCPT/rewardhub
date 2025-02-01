import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileActionsProps {
  isEditing: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileActions = ({ isEditing, loading, onSubmit }: ProfileActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
      {isEditing && (
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      )}
    </div>
  );
};