import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";
import type { DailyStats } from "@/types/admin";

interface StatsCardsProps {
  stats: DailyStats | undefined;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="text-yellow-500" />
          <div>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-bold">{stats?.pending_reviews || 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-sm text-muted-foreground">Approved Today</p>
            <p className="text-2xl font-bold">{stats?.approved_today || 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <XCircle className="text-red-500" />
          <div>
            <p className="text-sm text-muted-foreground">Rejected Today</p>
            <p className="text-2xl font-bold">{stats?.rejected_today || 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCards;