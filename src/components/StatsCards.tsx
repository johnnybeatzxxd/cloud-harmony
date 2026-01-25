import { Smartphone, Activity, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { automationApi, targetsApi } from "@/lib/api";
import { Target } from "lucide-react";

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconClassName?: string;
}

function StatItem({ icon: Icon, label, value, change, changeType = "neutral", iconClassName }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50",
        iconClassName
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground leading-none">{value}</p>
          {change && (
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}>
              {change}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['automation-status'],
    queryFn: automationApi.getStatus,
    refetchInterval: 5000,
  });

  const { data: targetStats, isLoading: isTargetsLoading } = useQuery({
    queryKey: ['target-stats'],
    queryFn: targetsApi.getStats,
    refetchInterval: 5000,
  });

  const isLoading = isStatusLoading || isTargetsLoading;

  const accounts = statusData?.accounts || [];

  const totalDevices = accounts.length;
  const activeAutomations = accounts.filter(a => a.runtime_status?.toLowerCase() === 'running').length;
  const followsToday = accounts.reduce((sum, a) => sum + (a.stats?.rolling_24h || 0), 0);
  // Count devices in cooldown or error as warnings
  const warnings = accounts.filter(a =>
    a.runtime_status?.toLowerCase() === 'cooldown' ||
    a.status?.toLowerCase() === 'error'
  ).length;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-[100px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between divide-x divide-border">
        <div className="px-6 first:pl-2 w-full">
          <StatItem
            icon={Smartphone}
            label="Total Devices"
            value={totalDevices}
            // change="+2" // We don't have historical data for change yet
            // changeType="positive"
            iconClassName="bg-primary/10 text-primary"
          />
        </div>
        <div className="px-6 w-full">
          <StatItem
            icon={Activity}
            label="Active Automations"
            value={activeAutomations}
            iconClassName="bg-success/10 text-success"
          />
        </div>
        <div className="px-6 w-full">
          <StatItem
            icon={UserPlus}
            label="Follows Today"
            value={followsToday.toLocaleString()}
            // change="+12%" 
            // changeType="positive"
            iconClassName="bg-chart-2/20 text-chart-2"
          />
        </div>
        <div className="px-6 last:pr-2 w-full">
          <StatItem
            icon={Target}
            label="Pending Leads"
            value={targetStats?.pending || 0}
            change={targetStats?.pending && targetStats.pending > 0 ? "Queue active" : "Queue empty"}
            changeType={targetStats?.pending && targetStats.pending > 0 ? "positive" : "neutral"}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>
      </div>
    </div>
  );
}
