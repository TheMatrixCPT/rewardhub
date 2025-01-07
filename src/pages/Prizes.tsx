import { useState } from "react";
import PrizeManagement from "@/components/admin/PrizeManagement";
import SubmissionManagement from "@/components/admin/SubmissionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Prizes = () => {
  const [activeTab, setActiveTab] = useState("prizes");

  const getHeading = () => {
    switch (activeTab) {
      case "prizes":
        return {
          title: "Prize Management",
          description: "Create and manage competition prizes"
        };
      case "submissions":
        return {
          title: "Submission Management",
          description: "Review and manage user submissions"
        };
      default:
        return {
          title: "Administration",
          description: "Manage your platform"
        };
    }
  };

  const { title, description } = getHeading();

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
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