
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, MapPin, Briefcase, BarChart, MessageSquare, Building2 } from "lucide-react";
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
import { DemographicsTable } from "@/components/admin/analytics/DemographicsTable";

type SortType = "name" | "count";

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("3");
  const [selectedPrize, setSelectedPrize] = useState<string>("all");
  const [locationSort, setLocationSort] = useState<SortType>("count");
  const [companySort, setCompanySort] = useState<SortType>("count");
  const [roleSort, setRoleSort] = useState<SortType>("count");

  const { data: analyticsData } = useQuery({
    queryKey: ["business-analytics", timeframe, selectedPrize],
    queryFn: async () => {
      console.log("Starting analytics data fetch...");
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeframe)));
      const oneMonthAgo = subMonths(new Date(), 1);
      
      // Get total registered users count (all users in the profiles table)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users with submissions in the last month)
      const { count: activeUsers } = await supabase
        .from('submissions')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())
        .not('user_id', 'is', null);

      // Get active prizes
      const { data: prizes } = await supabase
        .from('prizes')
        .select('*')
        .eq('active', true);

      // Get top performer (most points and approved submissions)
      const { data: topPerformers } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          company,
          job_title,
          avatar_url
        `);

      // Get points data for top performers
      const { data: pointsData } = await supabase
        .from('points')
        .select('user_id, points')
        .order('points', { ascending: false });

      // Get approved submissions count for top performers
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('user_id, status')
        .eq('status', 'approved');

      // Calculate top performer based on points and approved submissions
      let topPerformerOverall = null;
      if (topPerformers && pointsData && submissionsData) {
        const userStats = topPerformers.map(user => {
          const userPoints = pointsData
            .filter(p => p.user_id === user.id)
            .reduce((sum, p) => sum + p.points, 0);
          const approvedSubmissions = submissionsData
            .filter(s => s.user_id === user.id)
            .length;
          return {
            ...user,
            points: userPoints,
            approvedSubmissions
          };
        });

        // Sort by points and approved submissions
        userStats.sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return b.approvedSubmissions - a.approvedSubmissions;
        });

        topPerformerOverall = userStats[0];
      }

      // Get submissions with prize filter
      let submissionsQuery = supabase
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

      if (selectedPrize !== 'all') {
        submissionsQuery = submissionsQuery.eq('prize_id', selectedPrize);
      }

      const { data: submissions } = await submissionsQuery;

      // Get all profiles for demographics
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('address, company, job_title');

      // Process submissions per prize
      const submissionStats = (prizes || []).reduce((acc: {[key: string]: any}, prize) => {
        const prizeSubmissions = (submissions || []).filter(s => s.prize_id === prize.id);
        acc[prize.name] = {
          total: prizeSubmissions.length,
          approved: prizeSubmissions.filter(s => s.status === 'approved').length,
          pending: prizeSubmissions.filter(s => s.status === 'pending').length,
          rejected: prizeSubmissions.filter(s => s.status === 'rejected').length
        };
        return acc;
      }, {});

      // Process demographics with sorting options
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
        } else {
          acc['Not Specified'] = (acc['Not Specified'] || 0) + 1;
        }
        return acc;
      }, {});

      const companyStats = (profilesData || []).reduce((acc: {[key: string]: number}, profile) => {
        if (profile.company) {
          acc[profile.company] = (acc[profile.company] || 0) + 1;
        } else {
          acc['Not Specified'] = (acc['Not Specified'] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPrizes: prizes?.length || 0,
        prizes: prizes || [],
        topPerformerOverall,
        submissionsByPrize: Object.entries(submissionStats),
        locationDemographics: Object.entries(locationStats)
          .sort((a, b) => locationSort === 'name' ? a[0].localeCompare(b[0]) : b[1] - a[1]),
        jobRoleDemographics: Object.entries(jobRoleStats)
          .sort((a, b) => roleSort === 'name' ? a[0].localeCompare(b[0]) : b[1] - a[1]),
        companyDemographics: Object.entries(companyStats)
          .sort((a, b) => companySort === 'name' ? a[0].localeCompare(b[0]) : b[1] - a[1])
      };
    }
  });

  const handleLocationSortChange = (value: string) => {
    setLocationSort(value as SortType);
  };

  const handleCompanySortChange = (value: string) => {
    setCompanySort(value as SortType);
  };

  const handleRoleSortChange = (value: string) => {
    setRoleSort(value as SortType);
  };

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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Registered Users</p>
              <p className="text-3xl font-bold">{analyticsData?.totalUsers || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold">{analyticsData?.activeUsers || 0}</p>
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

        {/* Prize Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Prize Performance</h2>
            </div>
            <Select value={selectedPrize} onValueChange={setSelectedPrize}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select prize" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prizes</SelectItem>
                {analyticsData?.prizes.map(prize => (
                  <SelectItem key={prize.id} value={prize.id}>{prize.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              </div>
            ))}
          </div>
        </Card>

        {/* Demographics Tables */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <DemographicsTable
              title="Locations"
              data={analyticsData?.locationDemographics || []}
              sortType={locationSort}
              onSortChange={handleLocationSortChange}
            />
          </Card>

          <Card className="p-6">
            <DemographicsTable
              title="Job Roles"
              data={analyticsData?.jobRoleDemographics || []}
              sortType={roleSort}
              onSortChange={handleRoleSortChange}
            />
          </Card>

          <Card className="p-6">
            <DemographicsTable
              title="Companies"
              data={analyticsData?.companyDemographics || []}
              sortType={companySort}
              onSortChange={handleCompanySortChange}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
