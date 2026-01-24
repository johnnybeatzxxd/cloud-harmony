import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationSidebar } from "@/components/AutomationSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCards } from "@/components/StatsCards";
import { DeviceTable } from "@/components/DeviceTable";
import { toast } from "sonner";

const Index = () => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const handleStartAutomation = () => {
    if (selectedDeviceIds.length === 0) {
      toast.error("Please select at least one device");
      return;
    }
    toast.success(`Starting automation on ${selectedDeviceIds.length} device(s)`);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AutomationSidebar
        onStartAutomation={handleStartAutomation}
        selectedDeviceCount={selectedDeviceIds.length}
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <StatsCards />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Devices</h2>
              <Button
                onClick={handleStartAutomation}
                disabled={selectedDeviceIds.length === 0}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Start Selected ({selectedDeviceIds.length})
              </Button>
            </div>
            <DeviceTable onSelectionChange={setSelectedDeviceIds} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
