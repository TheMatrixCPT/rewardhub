
import { Card } from "@/components/ui/card";
import { Trophy, ChartLine, Award, UserPlus } from "lucide-react";

interface StatsGridProps {
  totalPoints: number;
  activitiesCount: number;
  userRank: number | string;
  referralStats?: {
    totalReferrals: number;
    pendingReferrals: number;
    convertedReferrals: number;
  };
}

const StatsGrid = ({ totalPoints, activitiesCount, userRank, referralStats }: StatsGridProps) => {
  const stats = [
    {
      title: "Total Points",
      value: totalPoints.toString(),
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Activities",
      value: activitiesCount.toString(),
      icon: ChartLine,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Rank",
      value: `#${userRank}`,
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Referrals",
      value: referralStats?.totalReferrals.toString() || "0",
      icon: UserPlus,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: referralStats?.pendingReferrals.toString() || "0",
      icon: UserPlus,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Converted",
      value: referralStats?.convertedReferrals.toString() || "0",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="p-3 animate-fade-in flex items-center"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`p-2 ${stat.bgColor} rounded-full mr-3`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
            <p className="text-sm font-semibold truncate">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
