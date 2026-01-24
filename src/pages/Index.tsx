import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutomationSidebar } from "@/components/AutomationSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCards } from "@/components/StatsCards";
import { DeviceTable } from "@/components/DeviceTable";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { automationApi } from "@/lib/api";
import { Loader2, StopCircle } from "lucide-react";

const Index = () => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch automation status to check if any automations are running
  const { data: statusData } = useQuery({
    queryKey: ['automation-status'],
    queryFn: automationApi.getStatus,
    refetchInterval: 5000,
  });

  const hasRunningAutomations = (statusData?.accounts || []).some(
    account => account.runtime_status === "RUNNING"
  );

  const startAutomationMutation = useMutation({
    mutationFn: (deviceIds: string[]) => automationApi.start({ device_ids: deviceIds }),
    onSuccess: (data) => {
      toast.success(data?.message || "Automation started successfully");
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['automation-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start automation");
    }
  });

  const stopAllMutation = useMutation({
    mutationFn: () => automationApi.stop({}), // Empty object stops all
    onSuccess: (data) => {
      toast.success(data?.message || "All automations stopped");
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['automation-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to stop automations");
    }
  });

  const handleStartAutomation = () => {
    if (selectedDeviceIds.length === 0) {
      toast.error("Please select at least one device");
      return;
    }
    startAutomationMutation.mutate(selectedDeviceIds);
  };

  const handleStopAll = () => {
    stopAllMutation.mutate();
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
              {hasRunningAutomations ? (
                <Button
                  onClick={handleStopAll}
                  disabled={stopAllMutation.isPending}
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {stopAllMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StopCircle className="w-4 h-4" />
                  )}
                  Stop All
                </Button>
              ) : (
                <Button
                  onClick={handleStartAutomation}
                  disabled={selectedDeviceIds.length === 0 || startAutomationMutation.isPending}
                  className="gap-2"
                >
                  {startAutomationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Start Selected ({selectedDeviceIds.length})
                </Button>
              )}
            </div>
            <DeviceTable onSelectionChange={setSelectedDeviceIds} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
