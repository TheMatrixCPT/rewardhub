import { useAuth } from "@/hooks/useAuth";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivities from "@/components/dashboard/RecentActivities";

const Home = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container py-8 space-y-8">
      <StatsGrid />
      <RecentActivities />
    </div>
  );
};

export default Home;