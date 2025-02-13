
import { useState } from "react";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PointsAdjustmentDialogProps {
  currentUserId: string;
}

export function PointsAdjustmentDialog({ currentUserId }: PointsAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        toast.error("User not found");
        return;
      }

      // Call the adjust_user_points function
      const { error } = await supabase.rpc('adjust_user_points', {
        admin_user_id: currentUserId,
        target_user_id: userData.id,
        point_adjustment: parseInt(points),
        adjustment_reason: reason
      });

      if (error) {
        console.error('Error adjusting points:', error);
        toast.error(error.message);
        return;
      }

      toast.success("Points adjusted successfully");
      setOpen(false);
      // Reset form
      setUserEmail("");
      setPoints("");
      setReason("");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to adjust points");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adjust Points</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust User Points</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="points">Points Adjustment</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Enter positive or negative number"
              required
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why points are being adjusted"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adjusting..." : "Adjust Points"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
