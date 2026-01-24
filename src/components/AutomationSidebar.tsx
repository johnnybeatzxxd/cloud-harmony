import { useState } from "react";
import { 
  Zap,
  ChevronRight,
  LayoutDashboard,
  Flame,
  UserPlus,
  Users,
  Settings
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

interface ConfigSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ icon: Icon, title, children, defaultOpen = false }: ConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-90"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-2 space-y-4 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Warmup configurations by day
const warmupConfigs = {
  1: {
    label: "Day 1 - The Ghost",
    feed: { enabled: true, minScrolls: 13, maxScrolls: 20 },
    reels: { enabled: true, minMinutes: 3, maxMinutes: 6 },
    limits: { maxLikes: 3, maxFollows: 2 },
    speed: "slow",
    chance: { follow: 30, like: 20, comment: 20 }
  },
  2: {
    label: "Day 2 - The Observer",
    feed: { enabled: true, minScrolls: 18, maxScrolls: 25 },
    reels: { enabled: true, minMinutes: 5, maxMinutes: 8 },
    limits: { maxLikes: 5, maxFollows: 3 },
    speed: "slow",
    chance: { follow: 20, like: 30, comment: 20 }
  },
  3: {
    label: "Day 3 - Waking Up",
    feed: { enabled: true, minScrolls: 25, maxScrolls: 30 },
    reels: { enabled: true, minMinutes: 5, maxMinutes: 10 },
    limits: { maxLikes: 10, maxFollows: 5 },
    speed: "normal",
    chance: { follow: 20, like: 30, comment: 30 }
  },
  4: {
    label: "Day 4 - Casual User",
    feed: { enabled: true, minScrolls: 45, maxScrolls: 50 },
    reels: { enabled: true, minMinutes: 10, maxMinutes: 15 },
    limits: { maxLikes: 15, maxFollows: 8 },
    speed: "normal",
    chance: { follow: 20, like: 30, comment: 30 }
  },
  5: {
    label: "Day 5 - Active User",
    feed: { enabled: true, minScrolls: 45, maxScrolls: 55 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 20 },
    limits: { maxLikes: 30, maxFollows: 8 },
    speed: "normal",
    chance: { follow: 20, like: 25, comment: 30 }
  },
  6: {
    label: "Day 6 - The Addict",
    feed: { enabled: true, minScrolls: 50, maxScrolls: 60 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 26 },
    limits: { maxLikes: 30, maxFollows: 10 },
    speed: "fast",
    chance: { follow: 20, like: 35, comment: 30 }
  },
  7: {
    label: "Day 7 - Full Power",
    feed: { enabled: true, minScrolls: 55, maxScrolls: 65 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 25 },
    limits: { maxLikes: 30, maxFollows: 12 },
    speed: "fast",
    chance: { follow: 40, like: 40, comment: 35 }
  }
};

type DayKey = keyof typeof warmupConfigs;

export function AutomationSidebar() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedDay, setSelectedDay] = useState<DayKey>(1);
  
  // Follow config state
  const [followConfig, setFollowConfig] = useState({
    batchSize: 100,
    sessionLimit2h: 5,
    minBatchStart: 1,
    cooldownHours: 2.0,
    patternBreak: 4,
    minDelay: 20,
    maxDelay: 45,
    doVetting: true
  });

  const currentWarmup = warmupConfigs[selectedDay];

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "slow": return "text-green-400";
      case "normal": return "text-yellow-400";
      case "fast": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <aside className="w-72 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">CloudPhone</h1>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={activeNav === "dashboard"}
          onClick={() => setActiveNav("dashboard")}
        />
        <NavItem
          icon={Users}
          label="Devices"
          isActive={activeNav === "devices"}
          onClick={() => setActiveNav("devices")}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          isActive={activeNav === "settings"}
          onClick={() => setActiveNav("settings")}
        />
      </nav>

      <Separator className="mx-4" />

      {/* Automation Config */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
          Automation Config
        </p>

        {/* Warmup Section */}
        <ConfigSection icon={Flame} title="Warmup" defaultOpen>
          <div className="space-y-4">
            {/* Day Selector */}
            <div className="space-y-2">
              <Label className="text-sm">Select Day</Label>
              <Select
                value={String(selectedDay)}
                onValueChange={(val) => setSelectedDay(Number(val) as DayKey)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(warmupConfigs).map(([day, config]) => (
                    <SelectItem key={day} value={day}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Day Config Display */}
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border">
              {/* Speed */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Speed</span>
                <span className={cn("text-xs font-medium uppercase", getSpeedColor(currentWarmup.speed))}>
                  {currentWarmup.speed}
                </span>
              </div>

              {/* Feed */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Feed Scrolls</span>
                  <div className="flex items-center gap-1">
                    <Switch checked={currentWarmup.feed.enabled} disabled className="scale-75" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.feed.minScrolls}</p>
                  </div>
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.feed.maxScrolls}</p>
                  </div>
                </div>
              </div>

              {/* Reels */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Reels (minutes)</span>
                  <Switch checked={currentWarmup.reels.enabled} disabled className="scale-75" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Min</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.reels.minMinutes}</p>
                  </div>
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Max</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.reels.maxMinutes}</p>
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Limits</span>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Likes</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.limits.maxLikes}</p>
                  </div>
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Follows</p>
                    <p className="text-sm font-medium text-foreground">{currentWarmup.limits.maxFollows}</p>
                  </div>
                </div>
              </div>

              {/* Chances */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Chances (%)</span>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Follow</p>
                    <p className="text-sm font-medium text-primary">{currentWarmup.chance.follow}%</p>
                  </div>
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Like</p>
                    <p className="text-sm font-medium text-primary">{currentWarmup.chance.like}%</p>
                  </div>
                  <div className="flex-1 p-2 rounded bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Comment</p>
                    <p className="text-sm font-medium text-primary">{currentWarmup.chance.comment}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ConfigSection>

        {/* Follow Automation Section */}
        <ConfigSection icon={UserPlus} title="Follow Automation">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Batch Size</Label>
                <Input
                  type="number"
                  value={followConfig.batchSize}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Session Limit (2h)</Label>
                <Input
                  type="number"
                  value={followConfig.sessionLimit2h}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, sessionLimit2h: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Min Batch Start</Label>
                <Input
                  type="number"
                  value={followConfig.minBatchStart}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, minBatchStart: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cooldown (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={followConfig.cooldownHours}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, cooldownHours: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pattern Break</Label>
              <Input
                type="number"
                value={followConfig.patternBreak}
                onChange={(e) => setFollowConfig(prev => ({ ...prev, patternBreak: Number(e.target.value) }))}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Delay Range (seconds)</Label>
                <span className="text-xs text-primary font-medium">{followConfig.minDelay}s - {followConfig.maxDelay}s</span>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={followConfig.minDelay}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, minDelay: Number(e.target.value) }))}
                  className="h-8 text-sm w-20"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  value={followConfig.maxDelay}
                  onChange={(e) => setFollowConfig(prev => ({ ...prev, maxDelay: Number(e.target.value) }))}
                  className="h-8 text-sm w-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="do-vetting" className="text-sm">Enable Vetting</Label>
              <Switch
                id="do-vetting"
                checked={followConfig.doVetting}
                onCheckedChange={(checked) => setFollowConfig(prev => ({ ...prev, doVetting: checked }))}
              />
            </div>
          </div>
        </ConfigSection>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
