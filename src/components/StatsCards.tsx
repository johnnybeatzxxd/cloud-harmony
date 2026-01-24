import { Smartphone, Activity, UserPlus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconClassName?: string;
}

function StatCard({ icon: Icon, label, value, change, changeType = "neutral", iconClassName }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-11 h-11 rounded-lg flex items-center justify-center",
          iconClassName
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            changeType === "positive" && "bg-success/10 text-success",
            changeType === "negative" && "bg-destructive/10 text-destructive",
            changeType === "neutral" && "bg-muted text-muted-foreground"
          )}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        icon={Smartphone}
        label="Total Devices"
        value="6"
        change="+2 this week"
        changeType="positive"
        iconClassName="bg-primary/10 text-primary"
      />
      <StatCard
        icon={Activity}
        label="Active Automations"
        value="3"
        iconClassName="bg-success/10 text-success"
      />
      <StatCard
        icon={UserPlus}
        label="Follows Today"
        value="1,247"
        change="+12%"
        changeType="positive"
        iconClassName="bg-chart-2/20 text-chart-2"
      />
      <StatCard
        icon={AlertTriangle}
        label="Rate Limit Warnings"
        value="2"
        change="Action needed"
        changeType="negative"
        iconClassName="bg-warning/10 text-warning"
      />
    </div>
  );
}
