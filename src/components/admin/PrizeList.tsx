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
      <div className="space-y-2">
        {prizes?.map((prize) => (
          <div
            key={prize.id}
            className={`flex items-center gap-4 p-3 rounded-lg border ${
              !prize.active ? 'bg-muted' : 'bg-card'
            }`}
          >
            {prize.image_url && (
              <img
                src={prize.image_url}
                alt={prize.name}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{prize.name}</h3>
                <span className="text-sm text-muted-foreground">
                  ({prize.points_required} points)
                </span>
              </div>
              {prize.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {prize.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span>Created: {format(new Date(prize.created_at), 'PP')}</span>
                {prize.deadline && (
                  <span>Deadline: {format(new Date(prize.deadline), 'PP')}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant={prize.active ? "destructive" : "default"}
                size="sm"
                onClick={() => togglePrizeStatus(prize.id, prize.active)}
                className={`${
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
                  size="sm"
                  onClick={() => deletePrize(prize.id)}
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PrizeList;