
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import StatsCards from "@/components/admin/StatsCards";
import SubmissionManagement from "@/components/admin/SubmissionManagement";
import { PointsAdjustmentDialog } from "@/components/admin/PointsAdjustmentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyStats } from "@/types/admin";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set initial active tab based on current path
  const getInitialTab = () => {
    if (location.pathname.includes('prizes')) return 'prizes';
    if (location.pathname.includes('points')) return 'points';
    return 'submissions';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value}`);
  };

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/auth");
          return;
        }

        setCurrentUserId(session.user.id);

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
          Manage platform settings and content
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submissions">Submission Management</TabsTrigger>
            <TabsTrigger value="points">Points Management</TabsTrigger>
            <TabsTrigger value="prizes">Prize Management</TabsTrigger>
          </TabsList>
          <TabsContent value="submissions" className="mt-6">
            <SubmissionManagement />
          </TabsContent>
          <TabsContent value="points" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Points Management</h2>
                  <p className="text-sm text-muted-foreground">View and analyze points</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="prizes" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Prize Management</h2>
                  <p className="text-sm text-muted-foreground">Manage prizes and adjust user points</p>
                </div>
                <PointsAdjustmentDialog currentUserId={currentUserId} />
              </div>
              <div className="text-center text-muted-foreground">
                Prize management functionality coming soon
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
