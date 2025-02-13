
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import StatsCards from "@/components/admin/StatsCards";
import SubmissionManagement from "@/components/admin/SubmissionManagement";
import { PointsAdjustmentDialog } from "@/components/admin/PointsAdjustmentDialog";
import type { DailyStats } from "@/types/admin";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/auth");
          return;
        }

        console.log("Session found, checking admin status");
        const { data: adminStatus, error: adminError } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });

        if (adminError) {
          console.error('Error checking admin status:', adminError);
          toast.error("Error checking permissions");
          navigate("/");
          return;
        }

        console.log("Admin status:", adminStatus);
        setIsAdmin(adminStatus);
        setIsLoading(false);

        if (!adminStatus) {
          toast.error("You don't have permission to access this page");
          navigate("/");
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        toast.error("Authentication error");
        navigate("/auth");
      }
    };

    checkAuthAndAdmin();
  }, [navigate]);

  const { data: stats } = useQuery<DailyStats>({
    queryKey: ['dailyStats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.rpc('get_daily_stats', {
        check_date: today
      });

      if (error) throw error;
      return data[0] as DailyStats;
    },
    enabled: isAdmin,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Manage submissions and user points
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 gap-8 mt-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Points Management</h2>
              <p className="text-sm text-muted-foreground">Adjust user points manually</p>
            </div>
            <PointsAdjustmentDialog currentUserId={supabase.auth.getSession().then(({ data }) => data.session?.user.id || '')} />
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Submission Management</h2>
          <SubmissionManagement />
        </section>
      </div>
    </div>
  );
};

export default Admin;
