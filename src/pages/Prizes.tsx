import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PrizeManagement from "@/components/admin/PrizeManagement";
import SubmissionManagement from "@/components/admin/SubmissionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Prizes = () => {
  const [activeTab, setActiveTab] = useState("prizes");
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const { session, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    console.log("Prizes page mounted, auth loading:", authLoading, "session:", session ? "exists" : "none", "isAdmin:", isAdmin);
    
    // If auth is not loading and there's no session, redirect to login
    if (!authLoading && !session) {
      console.log("No session found, redirecting to login");
      navigate("/login");
      return;
    }

    // If auth is not loading and user is not admin, redirect to home
    if (!authLoading && !isAdmin) {
      console.log("User is not admin, redirecting to home");
      navigate("/");
      return;
    }

    // If we have a session and user is admin, we can show the page
    if (session && isAdmin) {
      console.log("User is authenticated and admin, showing page");
      setPageLoading(false);
    }
  }, [navigate, session, authLoading, isAdmin]);

  const getHeading = () => {
    switch (activeTab) {
      case "prizes":
        return {
          title: "Prize Management",
          description: "Create and manage competition prizes"
        };
      case "submissions":
        return {
          title: "Submission Management",
          description: "Review and manage user submissions"
        };
      default:
        return {
          title: "Administration",
          description: "Manage your platform"
        };
    }
  };

  const { title, description } = getHeading();

  if (pageLoading || authLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="prizes">Prize Management</TabsTrigger>
          <TabsTrigger value="submissions">Submission Management</TabsTrigger>
        </TabsList>
        <TabsContent value="prizes" className="space-y-4">
          <PrizeManagement />
        </TabsContent>
        <TabsContent value="submissions" className="space-y-4">
          <SubmissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Prizes;