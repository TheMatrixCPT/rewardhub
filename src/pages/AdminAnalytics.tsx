
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, ChartBarIcon, Users } from "lucide-react";
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

  const { data: userStats } = useQuery({
    queryKey: ["user-analytics", timeframe],
    queryFn: async () => {
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeframe)));
      
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });

      if (usersError) throw usersError;

      const { data: prizeRegistrations, error: regError } = await supabase
        .from('prize_registrations')
        .select(`
          prize_id,
          prizes (
            name,
            registration_end
          )
        `)
        .gte('registered_at', startDate.toISOString());

      if (regError) throw regError;

      // Group registrations by prize
      const registrationsByPrize = prizeRegistrations.reduce((acc: any, reg) => {
        const prizeId = reg.prize_id;
        if (!acc[prizeId]) {
          acc[prizeId] = {
            name: reg.prizes?.name,
            count: 0,
            registration_end: reg.prizes?.registration_end
          };
        }
        acc[prizeId].count++;
        return acc;
      }, {});

      return {
        totalUsers: totalUsers[0]?.count || 0,
        prizeRegistrations: Object.values(registrationsByPrize)
      };
    }
  });

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
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
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Total Users</h2>
          </div>
          <p className="text-3xl font-bold">{userStats?.totalUsers || 0}</p>
        </Card>

        {userStats?.prizeRegistrations.map((prize: any) => (
          <Card key={prize.name} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold truncate">{prize.name}</h2>
            </div>
            <p className="text-3xl font-bold">{prize.count}</p>
            {prize.registration_end && (
              <p className="text-sm text-muted-foreground mt-2">
                Registration ends: {format(new Date(prize.registration_end), "PPP")}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
