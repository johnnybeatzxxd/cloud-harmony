import { useState, useEffect } from "react";
import { Play, Pause, MoreHorizontal, Smartphone, StopCircle, RotateCcw, Settings, Trash2 } from "lucide-react";
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
  status: "online" | "offline" | "running" | "paused";
  followCap: { current: number; max: number };
  isPlaying: boolean;
}

const mockDevices: Device[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: `Device ${i + 1}`,
  status: Math.random() > 0.5 ? "running" : Math.random() > 0.5 ? "online" : "paused",
  followCap: { current: Math.floor(Math.random() * 200), max: 200 },
  isPlaying: Math.random() > 0.5,
}));

const logMessages = [
  "Following @user_x23...",
  "Liked post #4521",
  "Comment sent successfully",
  "Waiting 3.2s...",
  "Following @tech_lover...",
  "Profile viewed",
  "Story watched",
  "DM scheduled",
  "Unfollowed inactive",
  "Rate limit check OK",
];

function AnimatedLog({ isActive }: { isActive: boolean }) {
  const [logs, setLogs] = useState<{ id: number; message: string }[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newLog = {
        id: counter,
        message: logMessages[Math.floor(Math.random() * logMessages.length)],
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 3));
      setCounter((c) => c + 1);
    }, 1000 + Math.random() * 500);

    return () => clearInterval(interval);
  }, [isActive, counter]);

  if (!isActive) {
    return <span className="text-muted-foreground text-sm">Idle</span>;
  }

  return (
    <div className="relative h-6 overflow-hidden w-40">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className={cn(
            "absolute left-0 text-sm font-mono text-primary truncate w-full",
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

function StatusBadge({ status }: { status: Device["status"] }) {
  const statusConfig = {
    online: { label: "Online", className: "bg-success/10 text-success border-success/20" },
    offline: { label: "Offline", className: "bg-muted/50 text-muted-foreground border-muted" },
    running: { label: "Running", className: "bg-primary/10 text-primary border-primary/20" },
    paused: { label: "Paused", className: "bg-warning/10 text-warning border-warning/20" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      <span className={cn(
        "w-2 h-2 rounded-full mr-2",
        status === "running" && "bg-primary animate-pulse-glow",
        status === "online" && "bg-success",
        status === "offline" && "bg-muted-foreground",
        status === "paused" && "bg-warning"
      )} />
      {config.label}
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
  const [devices, setDevices] = useState(mockDevices);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setDevices(mockDevices);
  }, []);

  const totalPages = Math.ceil(devices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevices = devices.slice(startIndex, endIndex);

  const togglePlayPause = (id: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === id
          ? {
            ...device,
            isPlaying: !device.isPlaying,
            status: device.isPlaying ? "paused" : "running",
          }
          : device
      )
    );
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

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px,1fr,120px,160px,180px,100px,50px] gap-4 px-6 py-4 bg-muted/30 border-b border-border">
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
                "grid grid-cols-[40px,1fr,120px,160px,180px,100px,50px] gap-4 px-6 py-4 items-center transition-colors",
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

              {/* Follow Cap */}
              <FollowCapProgress current={device.followCap.current} max={device.followCap.max} />

              {/* Logs */}
              <AnimatedLog isActive={device.isPlaying} />

              {/* Play/Pause */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePlayPause(device.id)}
                  disabled={device.status === "offline"}
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
          {devices.length} devices • {devices.filter((d) => d.status === "running").length} running
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
