import { useState } from "react";
import PrizeManagement from "@/components/admin/PrizeManagement";
import SubmissionManagement from "@/components/admin/SubmissionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Prizes = () => {
  const [activeTab, setActiveTab] = useState("prizes");

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Manage prizes and submissions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="prizes">Prize Management</TabsTrigger>
          <TabsTrigger value="submissions">Submission Management</TabsTrigger>
        </TabsList>
        <TabsContent value="prizes" className="space-y-4">
          <PrizeManagement />
        </TabsContent>
        <TabsContent value="submissions" className="space-y-4">
          <SubmissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Prizes;