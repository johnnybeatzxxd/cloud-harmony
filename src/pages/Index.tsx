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
import { Loader2, StopCircle, Layers } from "lucide-react";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



const Index = () => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<"follow" | "warmup">("warmup");
  const [currentWarmupDay, setCurrentWarmupDay] = useState<number>(1);
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Dynamically compute groups from accounts
  const groups = useMemo(() => {
    const accounts = statusData?.accounts || [];
    const uniqueGroups = new Set<string>();
    let hasUnassigned = false;

    accounts.forEach(acc => {
      if (acc.group_name) {
        uniqueGroups.add(acc.group_name);
      } else {
        hasUnassigned = true;
      }
    });

    const result = [{ id: "all", name: "All Devices" }];

    Array.from(uniqueGroups).sort().forEach(name => {
      result.push({ id: name, name });
    });

    if (hasUnassigned) {
      result.push({ id: "unassigned", name: "Unassigned" });
    }

    return result;
  }, [statusData?.accounts]);

  const startAutomationMutation = useMutation({
    mutationFn: (data: { deviceIds: string[]; mode: "follow" | "warmup"; warmupDay?: number }) => {
      return automationApi.start({
        device_ids: data.deviceIds,
        mode: data.mode,
        warmup_day: data.warmupDay,
      });
    },
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

  const handleStartAutomation = (mode: "follow" | "warmup", warmupDay?: number) => {
    if (selectedDeviceIds.length === 0) {
      toast.error("Please select at least one device");
      return;
    }
    startAutomationMutation.mutate({ deviceIds: selectedDeviceIds, mode, warmupDay });
  };

  const handleStopAll = () => {
    stopAllMutation.mutate();
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AutomationSidebar
        onStartAutomation={handleStartAutomation}
        selectedDeviceCount={selectedDeviceIds.length}
        onModeChange={setCurrentMode}
        onWarmupDayChange={setCurrentWarmupDay}
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader onSearch={setSearchQuery} />
        <main className="flex-1 p-8 space-y-6 overflow-auto">
          <StatsCards />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <h2 className="text-lg font-semibold text-foreground">Your Devices</h2>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-70">Group</span>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger className="w-[140px] h-8 bg-card border-border hover:bg-muted/30 transition-colors text-xs px-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary/80" />
                        <SelectValue placeholder="Select group" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  onClick={() => handleStartAutomation(currentMode, currentMode === "warmup" ? currentWarmupDay : undefined)}
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
            <DeviceTable
              onSelectionChange={setSelectedDeviceIds}
              searchQuery={searchQuery}
              globalMode={currentMode}
              globalWarmupDay={currentWarmupDay}
              selectedGroup={selectedGroupId}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
