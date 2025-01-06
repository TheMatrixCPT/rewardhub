import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PrizeManagement = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: "",
    description: "",
    points_required: "",
    image_url: "",
  });

  const { data: prizes, isLoading } = useQuery({
    queryKey: ['prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('prizes')
        .insert([
          {
            ...newPrize,
            points_required: parseInt(newPrize.points_required),
          },
        ]);

      if (error) throw error;

      toast.success("Prize added successfully!");
      setNewPrize({
        name: "",
        description: "",
        points_required: "",
        image_url: "",
      });
      queryClient.invalidateQueries({ queryKey: ['prizes'] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePrizeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("Prize status updated!");
      queryClient.invalidateQueries({ queryKey: ['prizes'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div>Loading prizes...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Prize</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prize Name</label>
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
              required
              value={newPrize.description}
              onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
              placeholder="Describe the prize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points Required</label>
            <Input
              required
              type="number"
              value={newPrize.points_required}
              onChange={(e) => setNewPrize({ ...newPrize, points_required: e.target.value })}
              placeholder="Enter required points"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <Input
              type="url"
              value={newPrize.image_url}
              onChange={(e) => setNewPrize({ ...newPrize, image_url: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Prize"}
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Prizes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prizes?.map((prize) => (
            <div
              key={prize.id}
              className="border rounded-lg p-4 space-y-2"
            >
              {prize.image_url && (
                <img
                  src={prize.image_url}
                  alt={prize.name}
                  className="w-full h-40 object-cover rounded-md"
                />
              )}
              <h3 className="font-semibold">{prize.name}</h3>
              <p className="text-sm text-gray-600">{prize.description}</p>
              <p className="text-sm font-medium">{prize.points_required} points required</p>
              <Button
                variant={prize.active ? "destructive" : "default"}
                onClick={() => togglePrizeStatus(prize.id, prize.active)}
              >
                {prize.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrizeManagement;