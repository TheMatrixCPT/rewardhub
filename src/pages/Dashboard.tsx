import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Award,
  BookOpen,
  Trophy,
  Linkedin,
  Users,
  ChartLine,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PrizeBanner from "@/components/prizes/PrizeBanner";

interface Activity {
  id: number;
  type: string;
  points: number;
  date: string;
  status: "completed" | "pending" | "verified";
}

const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch total points and activities count
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: points, error: pointsError } = await supabase
        .from("points")
        .select("points")
        .eq("user_id", user.id);

      const { count: activitiesCount, error: activitiesError } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      if (pointsError || activitiesError) throw new Error("Failed to fetch stats");

      const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;

      return {
        totalPoints,
        activitiesCount: activitiesCount || 0,
      };
    },
  });

  // Fetch user rank
  const { data: userRank } = useQuery({
    queryKey: ["user-rank"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get all users' total points
      const { data: allPoints, error } = await supabase
        .from("points")
        .select("user_id, points");

      if (error) throw error;

      // Calculate total points per user and sort
      const userTotals = allPoints.reduce((acc, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + curr.points;
        return acc;
      }, {} as Record<string, number>);

      const sortedUsers = Object.entries(userTotals)
        .sort(([, a], [, b]) => b - a);

      const rank = sortedUsers.findIndex(([id]) => id === user.id) + 1;
      return rank > 0 ? rank : "N/A";
    },
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: "Hackathon",
          points: 100,
          date: "2024-02-20",
          status: "verified",
        },
        {
          id: 2,
          type: "LinkedIn Post",
          points: 50,
          date: "2024-02-19",
          status: "completed",
        },
        {
          id: 3,
          type: "Networking Event",
          points: 75,
          date: "2024-02-18",
          status: "pending",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      title: "Total Points",
      value: userStats?.totalPoints.toString() || "0",
      icon: Trophy,
      color: "text-primary",
    },
    {
      title: "Activities",
      value: userStats?.activitiesCount.toString() || "0",
      icon: ChartLine,
      color: "text-secondary",
    },
    {
      title: "Rank",
      value: `#${userRank || "N/A"}`,
      icon: Award,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Track your progress and recent activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="p-6 animate-fade-in flex items-center"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <stat.icon className={`h-12 w-12 ${stat.color} mr-4`} />
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <PrizeBanner />

      {/* Recent Activities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              />
            ))
          ) : (
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="p-4 flex items-center justify-between animate-fade-in"
              >
                <div className="flex items-center">
                  {activity.type === "Hackathon" && (
                    <Trophy className="h-6 w-6 text-primary mr-3" />
                  )}
                  {activity.type === "LinkedIn Post" && (
                    <Linkedin className="h-6 w-6 text-primary mr-3" />
                  )}
                  {activity.type === "Networking Event" && (
                    <Users className="h-6 w-6 text-primary mr-3" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-4 ${
                      activity.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : activity.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                  <span className="font-semibold text-primary">
                    +{activity.points} pts
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;