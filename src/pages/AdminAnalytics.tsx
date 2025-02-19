
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

interface TopPerformer {
  prizeName: string;
  points: number;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
}

const AdminAnalytics = () => {
  const [timeframe, setTimeframe] = useState("3");

  const { data: analyticsData } = useQuery({
    queryKey: ["business-analytics", timeframe],
    queryFn: async () => {
      console.log("Starting analytics data fetch...");
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeframe)));
      
      // Get total users
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      console.log("Total users:", totalUsers);

      // Get prizes
      const { data: prizes, error: prizesError } = await supabase
        .from('prizes')
        .select('*')
        .eq('active', true);

      if (prizesError) {
        console.error("Error fetching prizes:", prizesError);
        throw prizesError;
      }

      console.log("Active prizes:", prizes);

      // Get overall top performer
      const { data: topPerformerOverall, error: topError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          company,
          job_title,
          points:points(points)
        `)
        .order('points', { ascending: false })
        .limit(1)
        .single();

      if (topError) {
        console.error("Error fetching top performer:", topError);
        throw topError;
      }

      console.log("Top performer:", topPerformerOverall);

      // Get top performers per prize using a join
      const { data: prizeTopPerformers, error: prizeTopError } = await supabase
        .from('prize_registrations')
        .select(`
          points,
          prize:prize_id(
            name,
            id
          ),
          user:user_id(
            first_name,
            last_name,
            company,
            job_title
          )
        `)
        .order('points', { ascending: false });

      if (prizeTopError) {
        console.error("Error fetching prize top performers:", prizeTopError);
        throw prizeTopError;
      }

      console.log("Prize top performers:", prizeTopPerformers);

      // Get submissions per prize with extended details
      const { data: prizeSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          id,
          prize_id,
          prizes (
            name
          ),
          linkedin_url,
          post_content,
          status,
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        throw submissionsError;
      }

      console.log("Prize submissions:", prizeSubmissions);

      // Get location demographics
      const { data: locationData, error: locationError } = await supabase
        .from('profiles')
        .select('address')
        .not('address', 'is', null);

      if (locationError) throw locationError;

      // Get industry demographics
      const { data: companyData, error: companyError } = await supabase
        .from('profiles')
        .select('company')
        .not('company', 'is', null);

      if (companyError) throw companyError;

      // Get job role demographics
      const { data: jobRoles, error: jobError } = await supabase
        .from('profiles')
        .select('job_title')
        .not('job_title', 'is', null);

      if (jobError) throw jobError;

      // Process submissions per prize
      const submissionStats = prizes.reduce((acc: {[key: string]: any}, prize) => {
        const prizeSubmissionsList = prizeSubmissions.filter(s => s.prize_id === prize.id);
        acc[prize.name] = {
          total: prizeSubmissionsList.length,
          approved: prizeSubmissionsList.filter(s => s.status === 'approved').length,
          pending: prizeSubmissionsList.filter(s => s.status === 'pending').length,
          rejected: prizeSubmissionsList.filter(s => s.status === 'rejected').length,
          // Placeholder for future LinkedIn metrics
          linkedInMetrics: {
            likes: 0,
            shares: 0,
            comments: 0,
            views: 0
          }
        };
        return acc;
      }, {});

      // Process top performers per prize
      const topPerformersByPrize = prizeTopPerformers.reduce((acc: { [key: string]: TopPerformer }, curr) => {
        const prizeId = curr.prize?.id;
        const prizeName = curr.prize?.name;
        
        if (prizeId && prizeName && (!acc[prizeId] || (acc[prizeId].points < curr.points))) {
          acc[prizeId] = {
            prizeName,
            points: curr.points,
            first_name: curr.user?.first_name,
            last_name: curr.user?.last_name,
            company: curr.user?.company,
            job_title: curr.user?.job_title
          };
        }
        return acc;
      }, {});

      // Process demographics data
      const locationStats = locationData.reduce((acc: {[key: string]: number}, curr) => {
        const city = curr.address?.split(',')[0]?.trim() || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {});

      const jobRoleStats = jobRoles.reduce((acc: {[key: string]: number}, curr) => {
        const role = curr.job_title || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const companyStats = companyData.reduce((acc: {[key: string]: number}, curr) => {
        const company = curr.company || 'Unknown';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      return {
        totalUsers: totalUsers[0]?.count || 0,
        totalPrizes: prizes.length,
        topPerformerOverall,
        topPerformersByPrize: Object.values(topPerformersByPrize),
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

        {/* Top Performers by Prize */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top Performers by Prize</h2>
          </div>
          <div className="space-y-6">
            {analyticsData?.topPerformersByPrize.map((performer, index) => (
              <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                <h3 className="font-medium">{performer.prizeName}</h3>
                <p className="text-sm">
                  {performer.first_name} {performer.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {performer.job_title} at {performer.company}
                </p>
                <p className="text-lg font-bold text-primary">{performer.points} points</p>
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
