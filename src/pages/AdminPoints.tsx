
import { useAuth } from "@/hooks/useAuth";
import { PointsAdjustmentDialog } from "@/components/admin/PointsAdjustmentDialog";

const AdminPoints = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Points Management</h1>
        <p className="text-muted-foreground">
          Add or remove points from users
        </p>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Use this form to adjust user points. You can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Add points (use positive numbers)</li>
              <li>Remove points (use negative numbers)</li>
              <li>Add a reason for the adjustment</li>
            </ul>
          </div>
          <PointsAdjustmentDialog currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default AdminPoints;
