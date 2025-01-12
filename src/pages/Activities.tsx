import RecentActivities from "@/components/dashboard/RecentActivities";

const Activities = () => {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-8">Activities</h1>
      <RecentActivities />
    </div>
  );
};

export default Activities;