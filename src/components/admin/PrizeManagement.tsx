import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PrizeForm from "./PrizeForm";
import PrizeList from "./PrizeList";
import type { Tables } from "@/integrations/supabase/types";

type Prize = Tables<"prizes">

const PrizeManagement = () => {
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
      <PrizeForm onPrizeAdded={refetch} />
      <PrizeList prizes={prizes} onPrizeUpdated={refetch} />
    </div>
  );
};

export default PrizeManagement;