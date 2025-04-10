import { useState } from "react";
import { TrainerProfile as TrainerProfileType } from "@/types/trainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroBanner } from "./HeroBanner";
// import { NavHeader } from "./NavHeader";
import { OverviewTab } from "./OverviewTab";
import { QualificationsTab } from "./QualificationsTab";
import { ServicesTab } from "./ServicesTab";
import { ScheduleTab } from "./ScheduleTab";
import { ContactTab } from "./ContactTab";
import { TrainerLoadingSkeleton } from "./LoadingSkeleton";

interface TrainerProfileProps {
  trainer: TrainerProfileType | null;
  loading: boolean;
  error: string | null;
}

export const TrainerProfile = ({
  trainer,
  loading,
  error,
}: TrainerProfileProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return <TrainerLoadingSkeleton />;
  }

  if (error || !trainer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Trainer Not Found</h2>
          <p className="text-muted-foreground">
            {error ||
              "The trainer profile you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    // Add position-relative to contain absolute elements
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen relative">
      {/* <NavHeader trainer={trainer} /> */}
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <HeroBanner trainer={trainer} />

        {/* Main content with tabs */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <div className="border-b z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="overview"
                className={`text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e11d48] data-[state=active]:to-[#f43f5e] data-[state=active]:text-white`}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="qualifications"
                className={`text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ea580c] data-[state=active]:to-[#fb923c] data-[state=active]:text-white`}
              >
                Qualifications
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className={`text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#65a30d] data-[state=active]:to-[#84cc16] data-[state=active]:text-white`}
              >
                Services
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className={`text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1d4ed8] data-[state=active]:to-[#3b82f6] data-[state=active]:text-white`}
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className={`text-base py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7c3aed] data-[state=active]:to-[var(--violet)] data-[state=active]:text-white`}
              >
                Contact
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="pt-6">
            <OverviewTab trainer={trainer} />
          </TabsContent>

          <TabsContent value="qualifications" className="pt-6">
            <QualificationsTab trainer={trainer} />
          </TabsContent>

          <TabsContent value="services" className="pt-6">
            <ServicesTab trainer={trainer} />
          </TabsContent>

          <TabsContent value="schedule" className="pt-6">
            <ScheduleTab trainer={trainer} />
          </TabsContent>

          <TabsContent value="contact" className="pt-6">
            <ContactTab trainer={trainer} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
