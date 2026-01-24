import { useState } from "react";
import { 
  Settings, 
  Users, 
  Clock, 
  Target, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Zap,
  ChevronRight,
  LayoutDashboard
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

export function AutomationSidebar() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [followDelay, setFollowDelay] = useState([5]);
  const [likeDelay, setLikeDelay] = useState([3]);
  const [dailyLimit, setDailyLimit] = useState(200);
  const [autoFollow, setAutoFollow] = useState(true);
  const [autoLike, setAutoLike] = useState(true);
  const [autoComment, setAutoComment] = useState(false);
  const [autoDM, setAutoDM] = useState(false);

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
          icon={Target}
          label="Targeting"
          isActive={activeNav === "targeting"}
          onClick={() => setActiveNav("targeting")}
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

        <ConfigSection icon={UserPlus} title="Follow Settings" defaultOpen>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-follow" className="text-sm">Auto Follow</Label>
              <Switch
                id="auto-follow"
                checked={autoFollow}
                onCheckedChange={setAutoFollow}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Delay (seconds)</Label>
                <span className="text-sm text-primary font-medium">{followDelay[0]}s</span>
              </div>
              <Slider
                value={followDelay}
                onValueChange={setFollowDelay}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Daily Limit</Label>
              <Input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="h-9"
              />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon={Heart} title="Like Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-like" className="text-sm">Auto Like</Label>
              <Switch
                id="auto-like"
                checked={autoLike}
                onCheckedChange={setAutoLike}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Delay (seconds)</Label>
                <span className="text-sm text-primary font-medium">{likeDelay[0]}s</span>
              </div>
              <Slider
                value={likeDelay}
                onValueChange={setLikeDelay}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon={MessageSquare} title="Comment Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-comment" className="text-sm">Auto Comment</Label>
              <Switch
                id="auto-comment"
                checked={autoComment}
                onCheckedChange={setAutoComment}
              />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon={Clock} title="DM Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-dm" className="text-sm">Auto DM</Label>
              <Switch
                id="auto-dm"
                checked={autoDM}
                onCheckedChange={setAutoDM}
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
