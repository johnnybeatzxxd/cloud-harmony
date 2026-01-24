import { Smartphone, Activity, UserPlus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between divide-x divide-border">
        <div className="px-6 first:pl-2 w-full">
          <StatItem
            icon={Smartphone}
            label="Total Devices"
            value="6"
            change="+2"
            changeType="positive"
            iconClassName="bg-primary/10 text-primary"
          />
        </div>
        <div className="px-6 w-full">
          <StatItem
            icon={Activity}
            label="Active Automations"
            value="3"
            iconClassName="bg-success/10 text-success"
          />
        </div>
        <div className="px-6 w-full">
          <StatItem
            icon={UserPlus}
            label="Follows Today"
            value="1,247"
            change="+12%"
            changeType="positive"
            iconClassName="bg-chart-2/20 text-chart-2"
          />
        </div>
        <div className="px-6 last:pr-2 w-full">
          <StatItem
            icon={AlertTriangle}
            label="Warnings"
            value="2"
            change="Action needed"
            changeType="negative"
            iconClassName="bg-warning/10 text-warning"
          />
        </div>
      </div>
    </div>
  );
}
