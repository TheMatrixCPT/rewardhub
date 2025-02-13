
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PrizeForm from "./PrizeForm";
import PrizeList from "./PrizeList";
import { PointsAdjustmentDialog } from "./PointsAdjustmentDialog";
import type { Tables } from "@/integrations/supabase/types";

type Prize = Tables<"prizes">

const PrizeManagement = () => {
  const { user } = useAuth();
  const { data: prizes, isLoading, refetch } = useQuery({
    queryKey: ['prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data as Prize[];
    },
  });

  if (isLoading) {
    return <div>Loading prizes...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prize Management</h2>
        <div className="flex items-center gap-4">
          <PointsAdjustmentDialog currentUserId={user?.id || ""} />
          <PrizeForm onPrizeAdded={refetch} />
        </div>
      </div>
      <PrizeList prizes={prizes} onPrizeUpdated={refetch} />
    </div>
  );
};

export default PrizeManagement;
