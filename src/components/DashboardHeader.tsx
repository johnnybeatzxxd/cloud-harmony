import { Search, Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AddLeadsModal } from "./AddLeadsModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ onSearch }: DashboardHeaderProps) {
  const [isAddLeadsOpen, setIsAddLeadsOpen] = useState(false);
  const [activationKey, setActivationKey] = useState(() => localStorage.getItem("activation_key") || "");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setIsExpired(true);
      toast.error("Activation key has expired. Please update it.");
    };

    const handleInvalid = () => {
      setActivationKey("");
      setIsExpired(false);
      localStorage.removeItem("activation_key");
      toast.error("Invalid activation key. Please enter a valid one.");
    };

    window.addEventListener('activation-key-expired', handleExpired);
    window.addEventListener('activation-key-invalid', handleInvalid);

    return () => {
      window.removeEventListener('activation-key-expired', handleExpired);
      window.removeEventListener('activation-key-invalid', handleInvalid);
    };
  }, []);

  const handleSaveKey = () => {
    if (!activationKey.trim()) {
      toast.error("Please enter a valid activation key");
      return;
    }
    localStorage.setItem("activation_key", activationKey);
    setIsExpired(false);
    toast.success("Activation key saved successfully");
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Device Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor and control your cloud devices
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="w-64 pl-9 h-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Settings & Activation Key */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Key className={`w-5 h-5 ${isExpired ? "text-yellow-500" : ""}`} />
              {!activationKey ? (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              ) : isExpired ? (
                <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">
                  {isExpired ? "Activation Expired" : "Activation Key"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isExpired
                    ? "Your session has expired. Please update your key."
                    : "Enter your activation key to access features"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Enter activation key"
                  type="password"
                />
                <Button onClick={handleSaveKey}>Save Key</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Leads */}
        <Button className="gap-2" onClick={() => setIsAddLeadsOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Leads
        </Button>

        <AddLeadsModal
          open={isAddLeadsOpen}
          onOpenChange={setIsAddLeadsOpen}
        />
      </div>
    </header>
  );
}
