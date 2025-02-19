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
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeframe)));
      
      // Get total users
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });

      if (usersError) throw usersError;

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

      if (topError) throw topError;

      // Get top performers per prize using a join
      const { data: prizeTopPerformers, error: prizeTopError } = await supabase
        .from('prize_registrations')
        .select(`
          points,
          prizes:prize_id (
            name,
            id
          ),
          profiles:user_id (
            first_name,
            last_name,
            company,
            job_title
          )
        `)
        .order('points', { ascending: false });

      if (prizeTopError) throw prizeTopError;

      // Get submissions per prize
      const { data: prizeSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          prize_id,
          prizes (
            name
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (submissionsError) throw submissionsError;

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
      const submissionStats = prizeSubmissions.reduce((acc: {[key: string]: number}, curr) => {
        const prizeName = curr.prizes?.name || 'Unknown';
        acc[prizeName] = (acc[prizeName] || 0) + 1;
        return acc;
      }, {});

      // Process top performers per prize
      const topPerformersByPrize = prizeTopPerformers.reduce((acc: { [key: string]: TopPerformer }, curr) => {
        const prizeId = curr.prizes?.id;
        const prizeName = curr.prizes?.name;
        
        if (prizeId && prizeName && (!acc[prizeId] || (acc[prizeId].points < curr.points))) {
          acc[prizeId] = {
            prizeName,
            points: curr.points,
            first_name: curr.profiles?.first_name,
            last_name: curr.profiles?.last_name,
            company: curr.profiles?.company,
            job_title: curr.profiles?.job_title
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
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold mb-4">{analyticsData?.totalUsers || 0}</p>
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
            <h2 className="text-lg font-semibold">Submissions per Prize</h2>
          </div>
          <div className="space-y-4">
            {analyticsData?.submissionsByPrize.map(([prizeName, count]) => (
              <div key={prizeName} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{prizeName}</h3>
                  <span className="text-xl font-bold">{count}</span>
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
