import { useState, useEffect } from "react";
import {
  Zap,
  Flame,
  UserPlus,
  Play,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configApi, SessionConfig } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Warmup configurations by day - now with state management
const defaultWarmupConfigs = {
  1: {
    label: "Day 1 - The Ghost",
    feed: { enabled: true, minScrolls: 13, maxScrolls: 20 },
    reels: { enabled: true, minMinutes: 3, maxMinutes: 6 },
    limits: { maxLikes: 3, maxFollows: 2 },
    speed: "slow" as const,
    chance: { follow: 30, like: 20, comment: 20 }
  },
  2: {
    label: "Day 2 - The Observer",
    feed: { enabled: true, minScrolls: 18, maxScrolls: 25 },
    reels: { enabled: true, minMinutes: 5, maxMinutes: 8 },
    limits: { maxLikes: 5, maxFollows: 3 },
    speed: "slow" as const,
    chance: { follow: 20, like: 30, comment: 20 }
  },
  3: {
    label: "Day 3 - Waking Up",
    feed: { enabled: true, minScrolls: 25, maxScrolls: 30 },
    reels: { enabled: true, minMinutes: 5, maxMinutes: 10 },
    limits: { maxLikes: 10, maxFollows: 5 },
    speed: "normal" as const,
    chance: { follow: 20, like: 30, comment: 30 }
  },
  4: {
    label: "Day 4 - Casual User",
    feed: { enabled: true, minScrolls: 45, maxScrolls: 50 },
    reels: { enabled: true, minMinutes: 10, maxMinutes: 15 },
    limits: { maxLikes: 15, maxFollows: 8 },
    speed: "normal" as const,
    chance: { follow: 20, like: 30, comment: 30 }
  },
  5: {
    label: "Day 5 - Active User",
    feed: { enabled: true, minScrolls: 45, maxScrolls: 55 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 20 },
    limits: { maxLikes: 30, maxFollows: 8 },
    speed: "normal" as const,
    chance: { follow: 20, like: 25, comment: 30 }
  },
  6: {
    label: "Day 6 - The Addict",
    feed: { enabled: true, minScrolls: 50, maxScrolls: 60 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 26 },
    limits: { maxLikes: 30, maxFollows: 10 },
    speed: "fast" as const,
    chance: { follow: 20, like: 35, comment: 30 }
  },
  7: {
    label: "Day 7 - Full Power",
    feed: { enabled: true, minScrolls: 55, maxScrolls: 65 },
    reels: { enabled: true, minMinutes: 15, maxMinutes: 25 },
    limits: { maxLikes: 30, maxFollows: 12 },
    speed: "fast" as const,
    chance: { follow: 40, like: 40, comment: 35 }
  }
};

type DayKey = keyof typeof defaultWarmupConfigs;
type SpeedType = "slow" | "normal" | "fast";
type WarmupConfig = typeof defaultWarmupConfigs[DayKey];

interface AutomationSidebarProps {
  onStartAutomation?: () => void;
  selectedDeviceCount?: number;
}

export function AutomationSidebar({ onStartAutomation, selectedDeviceCount = 0 }: AutomationSidebarProps) {
  const [activeMode, setActiveMode] = useState<"warmup" | "follow">("warmup");
  const [selectedDay, setSelectedDay] = useState<DayKey>(1);
  const [warmupConfigs, setWarmupConfigs] = useState(defaultWarmupConfigs);
  const { theme, setTheme } = useTheme();

  // Follow config state
  const queryClient = useQueryClient();

  // Fetch session config
  const { data: sessionConfig, isLoading: isConfigLoading } = useQuery({
    queryKey: ['session-config'],
    queryFn: configApi.get,
    refetchOnWindowFocus: false,
  });

  // Update session config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: SessionConfig) => configApi.update(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-config'] });
      toast.success("Configuration saved");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  });

  // Local state for follow config, initialized from API data when available
  const [localFollowConfig, setLocalFollowConfig] = useState<SessionConfig>({
    batch_size: 100,
    session_limit_2h: 5,
    min_batch_start: 1,
    cooldown_hours: 2.0,
    pattern_break: 4,
    min_delay: 20,
    max_delay: 45,
    do_vetting: true
  });

  // Sync local state with API data when it loads
  useEffect(() => {
    if (sessionConfig) {
      setLocalFollowConfig(sessionConfig);
    }
  }, [sessionConfig]);

  const handleConfigChange = (updates: Partial<SessionConfig>) => {
    const newConfig = { ...localFollowConfig, ...updates };
    setLocalFollowConfig(newConfig);
    // Debounce this in a real app, or add a "Save" button. 
    // For now, let's add a Save button or auto-save with debounce.
    // The user didn't specify, but auto-save is nice. 
    // Let's use a "Save Changes" button for explicit control as it's safer for config.
  };

  const saveConfig = () => {
    updateConfigMutation.mutate(localFollowConfig);
  };

  const currentWarmup = warmupConfigs[selectedDay];

  const updateWarmupConfig = (updates: Partial<WarmupConfig>) => {
    setWarmupConfigs(prev => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], ...updates }
    }));
  };

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
            <h1 className="font-semibold text-foreground">Insta Automations</h1>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <nav className="p-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
          Select Mode
        </p>
        <NavItem
          icon={Flame}
          label="Warmup"
          isActive={activeMode === "warmup"}
          onClick={() => setActiveMode("warmup")}
        />
        <NavItem
          icon={UserPlus}
          label="Follow Automation"
          isActive={activeMode === "follow"}
          onClick={() => setActiveMode("follow")}
        />
      </nav>

      <Separator className="mx-4" />

      {/* Config Content */}
      <ScrollArea className="flex-1 p-4">
        {activeMode === "warmup" ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Warmup Configuration
            </p>

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

            {/* Editable Config */}
            <div className="space-y-4 p-3 rounded-lg bg-muted/30 border border-border">
              {/* Speed */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Speed</Label>
                <Select
                  value={currentWarmup.speed}
                  onValueChange={(val: SpeedType) => updateWarmupConfig({ speed: val })}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">
                      <span className="text-green-400">Slow</span>
                    </SelectItem>
                    <SelectItem value="normal">
                      <span className="text-yellow-400">Normal</span>
                    </SelectItem>
                    <SelectItem value="fast">
                      <span className="text-red-400">Fast</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Feed Scrolls</Label>
                  <Switch
                    checked={currentWarmup.feed.enabled}
                    onCheckedChange={(checked) => updateWarmupConfig({
                      feed: { ...currentWarmup.feed, enabled: checked }
                    })}
                    className="scale-75"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Min</span>
                    <Input
                      type="number"
                      value={currentWarmup.feed.minScrolls}
                      onChange={(e) => updateWarmupConfig({
                        feed: { ...currentWarmup.feed, minScrolls: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <Input
                      type="number"
                      value={currentWarmup.feed.maxScrolls}
                      onChange={(e) => updateWarmupConfig({
                        feed: { ...currentWarmup.feed, maxScrolls: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Reels */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Reels (minutes)</Label>
                  <Switch
                    checked={currentWarmup.reels.enabled}
                    onCheckedChange={(checked) => updateWarmupConfig({
                      reels: { ...currentWarmup.reels, enabled: checked }
                    })}
                    className="scale-75"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Min</span>
                    <Input
                      type="number"
                      value={currentWarmup.reels.minMinutes}
                      onChange={(e) => updateWarmupConfig({
                        reels: { ...currentWarmup.reels, minMinutes: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <Input
                      type="number"
                      value={currentWarmup.reels.maxMinutes}
                      onChange={(e) => updateWarmupConfig({
                        reels: { ...currentWarmup.reels, maxMinutes: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Limits</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max Likes</span>
                    <Input
                      type="number"
                      value={currentWarmup.limits.maxLikes}
                      onChange={(e) => updateWarmupConfig({
                        limits: { ...currentWarmup.limits, maxLikes: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Max Follows</span>
                    <Input
                      type="number"
                      value={currentWarmup.limits.maxFollows}
                      onChange={(e) => updateWarmupConfig({
                        limits: { ...currentWarmup.limits, maxFollows: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Chances */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Chances (%)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Follow</span>
                    <Input
                      type="number"
                      value={currentWarmup.chance.follow}
                      onChange={(e) => updateWarmupConfig({
                        chance: { ...currentWarmup.chance, follow: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Like</span>
                    <Input
                      type="number"
                      value={currentWarmup.chance.like}
                      onChange={(e) => updateWarmupConfig({
                        chance: { ...currentWarmup.chance, like: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Comment</span>
                    <Input
                      type="number"
                      value={currentWarmup.chance.comment}
                      onChange={(e) => updateWarmupConfig({
                        chance: { ...currentWarmup.chance, comment: Number(e.target.value) }
                      })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Follow Configuration
            </p>

            <div className="space-y-4 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Batch Size</Label>
                  <Input
                    type="number"
                    value={localFollowConfig.batch_size}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, batch_size: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Session Limit (2h)</Label>
                  <Input
                    type="number"
                    value={localFollowConfig.session_limit_2h}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, session_limit_2h: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Min Batch Start</Label>
                  <Input
                    type="number"
                    value={localFollowConfig.min_batch_start}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, min_batch_start: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cooldown (hours)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={localFollowConfig.cooldown_hours}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, cooldown_hours: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Pattern Break</Label>
                <Input
                  type="number"
                  value={localFollowConfig.pattern_break}
                  onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, pattern_break: Number(e.target.value) }))}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Delay Range (seconds)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={localFollowConfig.min_delay}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, min_delay: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="number"
                    value={localFollowConfig.max_delay}
                    onChange={(e) => setLocalFollowConfig(prev => ({ ...prev, max_delay: Number(e.target.value) }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="do-vetting" className="text-sm">Enable Vetting</Label>
                <Switch
                  id="do-vetting"
                  checked={localFollowConfig.do_vetting}
                  onCheckedChange={(checked) => setLocalFollowConfig(prev => ({ ...prev, do_vetting: checked }))}
                />
              </div>

              <Button
                onClick={saveConfig}
                disabled={updateConfigMutation.isPending || isConfigLoading}
                className="w-full"
                variant="secondary"
              >
                {updateConfigMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Configuration
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Start Button - Only for Follow Automation */}
      {activeMode === "follow" && (
        <div className="p-4 border-t border-border">
          <Button
            onClick={onStartAutomation}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            size="lg"
          >
            <Play className="w-5 h-5" />
            Start Selected ({selectedDeviceCount})
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-medium">Dark Mode</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>


      </div>
    </aside>
  );
}
