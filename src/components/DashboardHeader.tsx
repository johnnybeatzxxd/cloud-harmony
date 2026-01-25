import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddLeadsModal } from "./AddLeadsModal";

export function DashboardHeader() {
  const [isAddLeadsOpen, setIsAddLeadsOpen] = useState(false);

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
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
            3
          </Badge>
        </Button>

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
