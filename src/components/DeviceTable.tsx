import { useState, useEffect } from "react";
import { Play, Pause, MoreHorizontal, Smartphone, StopCircle, RotateCcw, Settings, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsApi, automationApi, logsApi, AccountWithStats, LogEntry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Device {
  id: string;
  name: string;
  status: string; // Raw runtime_status
  followCap: { current: number; max: number };
  isPlaying: boolean;
  stats: {
    recent_2h: number;
    rolling_24h: number;
  };
}

// Map backend Account to frontend Device interface
function mapAccountToDevice(account: AccountWithStats): Device {
  return {
    id: account.device_id,
    name: account.profile_name || `Device ${account.device_id}`,
    status: account.runtime_status, // Use raw runtime_status as requested
    followCap: { current: 0, max: account.daily_limit },
    isPlaying: account.is_enabled && account.runtime_status === "RUNNING", // Check specific running state
    stats: account.stats || { recent_2h: 0, rolling_24h: 0 }
  };
}


function AnimatedLog({ isActive, deviceId }: { isActive: boolean; deviceId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!isActive) {
      setLogs([]); // Clear logs when inactive
      return;
    }

    // Connect to real-time log stream
    const cleanup = logsApi.connectToLogStream(
      deviceId,
      (newLog) => {
        setLogs((prev) => [newLog, ...prev].slice(0, 3));
      },
      (error) => {
        console.error(`WebSocket error for device ${deviceId}:`, error);
      }
    );

    return cleanup;
  }, [isActive, deviceId]);

  if (!isActive) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className="relative h-6 overflow-hidden w-full">
      {logs.map((log, index) => (
        <div
          key={`${log.id}-${index}`}
          className={cn(
            "absolute left-0 text-sm font-mono text-primary w-full",
            index === 0 && "animate-fade-in-up"
          )}
          style={{
            top: `${index * 24}px`,
            opacity: index === 0 ? 1 : 0,
          }}
        >
          {log.message}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  // Determine style based on status content
  let className = "bg-muted/50 text-muted-foreground border-muted";
  let dotClass = "bg-muted-foreground";

  const s = status ? status.toUpperCase() : "UNKNOWN";

  if (s === "RUNNING") {
    className = "bg-primary/10 text-primary border-primary/20";
    dotClass = "bg-primary animate-pulse-glow";
  } else if (s === "READY" || s === "ACTIVE") {
    className = "bg-success/10 text-success border-success/20";
    dotClass = "bg-success";
  } else if (s === "PAUSED" || s === "COOLDOWN") {
    className = "bg-warning/10 text-warning border-warning/20";
    dotClass = "bg-warning";
  }

  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      <span className={cn("w-2 h-2 rounded-full mr-2", dotClass)} />
      {status || "Unknown"}
    </Badge>
  );
}

function FollowCapProgress({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 90;
  const isComplete = percentage >= 100;

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isComplete ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={cn(
        "text-sm font-medium tabular-nums min-w-[60px]",
        isComplete ? "text-destructive" : isNearLimit ? "text-warning" : "text-foreground"
      )}>
        {current}/{max}
      </span>
    </div>
  );
}

interface DeviceTableProps {
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DeviceTable({ onSelectionChange }: DeviceTableProps) {
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch automation status to get accounts with stats
  const { data: statusData, isLoading, isError, error } = useQuery({
    queryKey: ['automation-status'],
    queryFn: automationApi.getStatus,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const devices = (statusData?.accounts || []).map(mapAccountToDevice);

  // Mutation for starting automation on a device
  const startMutation = useMutation({
    mutationFn: (deviceId: string) => automationApi.start({ device_ids: [deviceId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-status'] });
      toast({
        title: "Start signal sent",
        description: "Automation start signal sent to device.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for stopping automation on a device
  const stopMutation = useMutation({
    mutationFn: (deviceId: string) => automationApi.stop({ device_ids: [deviceId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-status'] });
      toast({
        title: "Stop signal sent",
        description: "Automation stop signal sent to device.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalPages = Math.ceil(devices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevices = devices.slice(startIndex, endIndex);

  const togglePlayPause = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    if (device.isPlaying) {
      stopMutation.mutate(id);
    } else {
      startMutation.mutate(id);
    }
  };

  const toggleDeviceSelection = (id: string) => {
    setSelectedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange?.(Array.from(newSet));
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDevices.size === devices.length) {
      setSelectedDevices(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = devices.map(d => d.id);
      setSelectedDevices(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  const isAllSelected = selectedDevices.size === devices.length && devices.length > 0;
  const isPartiallySelected = selectedDevices.size > 0 && selectedDevices.size < devices.length;

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading devices...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <h3 className="text-lg font-semibold">Failed to load devices</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['automation-status'] })}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px,250px,110px,80px,80px,140px,1fr,60px,40px] gap-4 px-6 py-4 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isAllSelected}
            ref={(ref) => {
              if (ref) {
                (ref as HTMLButtonElement).dataset.state = isPartiallySelected ? "indeterminate" : isAllSelected ? "checked" : "unchecked";
              }
            }}
            onCheckedChange={toggleSelectAll}
            className="border-muted-foreground/50"
          />
        </div>
        <div className="text-sm font-semibold text-foreground">Device</div>
        <div className="text-sm font-semibold text-foreground">Status</div>
        <div className="text-sm font-semibold text-foreground">2h</div>
        <div className="text-sm font-semibold text-foreground">24h</div>
        <div className="text-sm font-semibold text-foreground">Follow Cap</div>
        <div className="text-sm font-semibold text-foreground">Logs</div>
        <div className="text-sm font-semibold text-foreground text-center">Control</div>
        <div></div>
      </div>

      {/* Body */}
      <ScrollArea className="h-[600px]">
        <div className="divide-y divide-border">
          {currentDevices.map((device, index) => (
            <div
              key={device.id}
              className={cn(
                "grid grid-cols-[40px,250px,110px,80px,80px,140px,1fr,60px,40px] gap-4 px-6 py-4 items-center transition-colors",
                selectedDevices.has(device.id) ? "bg-primary/5" : "hover:bg-muted/10"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={selectedDevices.has(device.id)}
                  onCheckedChange={() => toggleDeviceSelection(device.id)}
                  className="border-muted-foreground/50"
                />
              </div>

              {/* Device Name */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  selectedDevices.has(device.id) ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">{device.name}</span>
                  <p className="text-xs text-muted-foreground">ID: {device.id}</p>
                </div>
              </div>

              {/* Status */}
              <StatusBadge status={device.status} />

              {/* Stats */}
              <div className="text-sm font-mono text-muted-foreground">
                {device.stats.recent_2h}
              </div>
              <div className="text-sm font-mono text-muted-foreground">
                {device.stats.rolling_24h}
              </div>

              {/* Follow Cap */}
              <FollowCapProgress current={device.followCap.current} max={device.followCap.max} />

              {/* Logs */}
              <AnimatedLog isActive={device.isPlaying} deviceId={device.id} />

              {/* Play/Pause */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePlayPause(device.id)}
                  disabled={device.status.toUpperCase() === "OFFLINE"}
                  className={cn(
                    "rounded-full transition-all",
                    device.isPlaying
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  {device.isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Automation
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart Device
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Device Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Device
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-6 py-3 bg-muted/20 border-t border-border flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {devices.length} devices • {devices.filter((d) => d.status.toUpperCase() === "RUNNING").length} running
        </p>
        {selectedDevices.size > 0 && (
          <p className="text-sm text-primary font-medium">
            {selectedDevices.size} selected
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
