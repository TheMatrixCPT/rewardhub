import PrizeManagement from "@/components/admin/PrizeManagement";

const Prizes = () => {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Prize Management</h1>
          <p className="text-muted-foreground">
            Add and manage prizes for users
          </p>
        </div>
      </div>
      <PrizeManagement />
    </div>
  );
};

export default Prizes;