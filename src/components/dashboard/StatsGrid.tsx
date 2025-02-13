
import { Card } from "@/components/ui/card";
import { Trophy, ChartLine, Award } from "lucide-react";

interface StatsGridProps {
  totalPoints: number;
  activitiesCount: number;
  userRank: number | string;
}

const StatsGrid = ({ totalPoints, activitiesCount, userRank }: StatsGridProps) => {
  const stats = [
    {
      title: "Total Points",
      value: totalPoints.toString(),
      icon: Trophy,
      color: "text-primary",
    },
    {
      title: "Activities",
      value: activitiesCount.toString(),
      icon: ChartLine,
      color: "text-secondary",
    },
    {
      title: "Rank",
      value: `#${userRank}`,
      icon: Award,
      color: "text-accent",
    },
  ];

  return (
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
  );
};

export default StatsGrid;
