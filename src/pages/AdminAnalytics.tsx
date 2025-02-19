import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, MapPin, Briefcase, BarChart, MessageSquare, Building2, Share2, ThumbsUp, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth } from "date-fns";

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("3");

  const { data: analyticsData } = useQuery({
    queryKey: ["business-analytics", timeframe],
    queryFn: async () => {
      console.log("Starting analytics data fetch...");
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeframe)));
      
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      console.log("Total users:", totalUsers);

      // Get active prizes
      const { data: prizes } = await supabase
        .from('prizes')
        .select('*')
        .eq('active', true);

      console.log("Active prizes:", prizes);

      // Get top performer by calculating total points
      const { data: pointsData } = await supabase
        .rpc('get_user_rankings')
        .limit(1);

      console.log("Points data:", pointsData);

      let topPerformerOverall = null;
      if (pointsData?.[0]) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('first_name, last_name, company, job_title, avatar_url')
          .eq('id', pointsData[0].user_id)
          .single();

        if (userData) {
          topPerformerOverall = {
            ...userData,
            points: pointsData[0].rank === 1 ? pointsData[0].points || 0 : 0
          };
        }
      }

      // Get submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select(`
          id,
          prize_id,
          prizes (
            id,
            name
          ),
          status,
          linkedin_url,
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      console.log("Submissions:", submissions);

      // Get demographics data
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('address, company, job_title');

      console.log("Profiles data:", profilesData);

      // Process submissions per prize
      const submissionStats = (prizes || []).reduce((acc: {[key: string]: any}, prize) => {
        const prizeSubmissions = (submissions || []).filter(s => s.prize_id === prize.id);
        acc[prize.name] = {
          total: prizeSubmissions.length,
          approved: prizeSubmissions.filter(s => s.status === 'approved').length,
          pending: prizeSubmissions.filter(s => s.status === 'pending').length,
          rejected: prizeSubmissions.filter(s => s.status === 'rejected').length,
          linkedInMetrics: {
            likes: 0,
            shares: 0,
            comments: 0,
            views: 0
          }
        };
        return acc;
      }, {});

      // Process demographics data
      const locationStats = (profilesData || []).reduce((acc: {[key: string]: number}, profile) => {
        if (profile.address) {
          const city = profile.address.split(',')[0].trim();
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {});

      const jobRoleStats = (profilesData || []).reduce((acc: {[key: string]: number}, profile) => {
        if (profile.job_title) {
          acc[profile.job_title] = (acc[profile.job_title] || 0) + 1;
        }
        return acc;
      }, {});

      const companyStats = (profilesData || []).reduce((acc: {[key: string]: number}, profile) => {
        if (profile.company) {
          acc[profile.company] = (acc[profile.company] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        totalUsers: totalUsers || 0,
        totalPrizes: prizes?.length || 0,
        topPerformerOverall,
        submissionsByPrize: Object.entries(submissionStats),
        locationDemographics: Object.entries(locationStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        jobRoleDemographics: Object.entries(jobRoleStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        companyDemographics: Object.entries(companyStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      };
    }
  });

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Business Analytics Dashboard</h1>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last month</SelectItem>
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {/* Platform Overview */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Platform Overview</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{analyticsData?.totalUsers || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Prizes</p>
              <p className="text-3xl font-bold">{analyticsData?.totalPrizes || 0}</p>
            </div>
          </div>
        </Card>

        {/* Overall Top Performer */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Overall Top Performer</h2>
          </div>
          {analyticsData?.topPerformerOverall && (
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {analyticsData.topPerformerOverall.first_name} {analyticsData.topPerformerOverall.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {analyticsData.topPerformerOverall.job_title} at {analyticsData.topPerformerOverall.company}
              </p>
              <p className="text-2xl font-bold text-primary">
                {analyticsData.topPerformerOverall.points} points
              </p>
            </div>
          )}
        </Card>

        {/* Submissions per Prize */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Prize Performance</h2>
          </div>
          <div className="space-y-6">
            {analyticsData?.submissionsByPrize.map(([prizeName, stats]: [string, any]) => (
              <div key={prizeName} className="space-y-2">
                <h3 className="text-lg font-semibold">{prizeName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">LinkedIn Engagement</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Likes</p>
                        <p className="text-lg font-semibold">{stats.linkedInMetrics.likes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Shares</p>
                        <p className="text-lg font-semibold">{stats.linkedInMetrics.shares}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Comments</p>
                        <p className="text-lg font-semibold">{stats.linkedInMetrics.comments}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-lg font-semibold">{stats.linkedInMetrics.views}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Location Demographics */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Top Locations</h2>
            </div>
            <div className="space-y-2">
              {analyticsData?.locationDemographics.map(([location, count]) => (
                <div key={location} className="flex justify-between items-center">
                  <span className="text-sm">{location}</span>
                  <span className="text-sm font-semibold">{count} users</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Job Roles */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Popular Job Roles</h2>
            </div>
            <div className="space-y-2">
              {analyticsData?.jobRoleDemographics.map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm">{role}</span>
                  <span className="text-sm font-semibold">{count} users</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Companies */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Top Companies</h2>
            </div>
            <div className="space-y-2">
              {analyticsData?.companyDemographics.map(([company, count]) => (
                <div key={company} className="flex justify-between items-center">
                  <span className="text-sm">{company}</span>
                  <span className="text-sm font-semibold">{count} users</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
