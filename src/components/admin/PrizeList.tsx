import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Prize = Tables<"prizes">

interface PrizeListProps {
  prizes: Prize[] | undefined;
  onPrizeUpdated: () => void;
}

const PrizeList = ({ prizes, onPrizeUpdated }: PrizeListProps) => {
  const togglePrizeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("Prize status updated!");
      onPrizeUpdated();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deletePrize = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Prize deleted successfully!");
      onPrizeUpdated();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Current Prizes</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prizes?.map((prize) => (
          <Card
            key={prize.id}
            className={`p-4 space-y-3 ${!prize.active ? 'opacity-75 bg-muted' : ''}`}
          >
            {prize.image_url && (
              <img
                src={prize.image_url}
                alt={prize.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            <h3 className="font-semibold">{prize.name}</h3>
            <p className="text-sm text-gray-600">{prize.description}</p>
            <p className="text-sm font-medium">{prize.points_required} points required</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Created: {format(new Date(prize.created_at), 'PPP')}</p>
              {prize.deadline && (
                <p>Deadline: {format(new Date(prize.deadline), 'PPP')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={prize.active ? "destructive" : "default"}
                onClick={() => togglePrizeStatus(prize.id, prize.active)}
                className={`flex-1 ${
                  prize.active 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {prize.active ? "Deactivate" : "Activate"}
              </Button>
              {!prize.active && (
                <Button
                  variant="outline"
                  onClick={() => deletePrize(prize.id)}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default PrizeList;