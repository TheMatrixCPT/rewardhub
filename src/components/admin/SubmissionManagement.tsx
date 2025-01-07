import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionsTable from "./SubmissionsTable";
import PrizeManagement from "./PrizeManagement";
import type { Submission } from "@/types/admin";

const SubmissionManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "submissions");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['recentSubmissions', filter],
    queryFn: async () => {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          activities (
            name,
            points
          )
        `)
        .order('created_at', { ascending: false });

      switch (filter) {
        case 'pending':
          query = query.eq('status', 'pending');
          break;
        case 'approved':
          query = query.eq('status', 'approved');
          break;
        case 'rejected':
          query = query.eq('status', 'rejected');
          break;
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          query = query.gte('created_at', today.toISOString());
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Submission[];
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  const getHeading = () => {
    switch (activeTab) {
      case "submissions":
        return {
          title: "Submission Management",
          description: "Review and manage user submissions"
        };
      case "prizes":
        return {
          title: "Prize Management",
          description: "Create and manage competition prizes"
        };
      default:
        return {
          title: "Administration",
          description: "Manage your platform"
        };
    }
  };

  const { title, description } = getHeading();

  return (
    <Card>
      <div className="p-6 border-b">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex justify-between items-center">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="prizes">Prize Management</TabsTrigger>
          </TabsList>
          {activeTab === "submissions" && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Filter submissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="rejected">Rejected Only</SelectItem>
                  <SelectItem value="today">Today's Submissions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="submissions" className="m-0">
          <SubmissionsTable submissions={submissions} />
        </TabsContent>
        
        <TabsContent value="prizes" className="m-0 p-6">
          <PrizeManagement />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SubmissionManagement;