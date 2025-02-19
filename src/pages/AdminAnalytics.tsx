
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

      // Get top performer (user with most points)
      const { data: topPerformer, error: topError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          company,
          job_title,
          points:points(sum)
        `)
        .inner_join('points', { foreignTable: 'points', conditionType: 'eq', condition: { user_id: 'id' } })
        .group('id')
        .order('sum', { ascending: false })
        .limit(1)
        .single();

      if (topError) throw topError;

      // Get location demographics
      const { data: locationData, error: locationError } = await supabase
        .from('profiles')
        .select('address')
        .not('address', 'is', null);

      if (locationError) throw locationError;

      // Get industry demographics (based on company field)
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

      // Get total submissions (posts)
      const { data: totalPosts, error: postsError } = await supabase
        .from('submissions')
        .select('count', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      if (postsError) throw postsError;

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
        topPerformer,
        locationDemographics: Object.entries(locationStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        jobRoleDemographics: Object.entries(jobRoleStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        companyDemographics: Object.entries(companyStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        totalPosts: totalPosts[0]?.count || 0
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Overall Platform Statistics */}
        <Card className="p-6 col-span-full bg-gradient-to-r from-primary/10 to-primary/5">
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
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-3xl font-bold">{analyticsData?.totalPosts || 0}</p>
            </div>
          </div>
        </Card>

        {/* Top Performer */}
        <Card className="p-6 col-span-full md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Top Performer</h2>
          </div>
          {analyticsData?.topPerformer && (
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {analyticsData.topPerformer.first_name} {analyticsData.topPerformer.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {analyticsData.topPerformer.job_title} at {analyticsData.topPerformer.company}
              </p>
              <p className="text-2xl font-bold text-primary">
                {analyticsData.topPerformer.points} points
              </p>
            </div>
          )}
        </Card>

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
  );
};

export default AdminAnalytics;
