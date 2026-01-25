import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { targetsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddLeadsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddLeadsModal({ open, onOpenChange }: AddLeadsModalProps) {
    const [input, setInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddLeads = async () => {
        const leads = input
            .split("\n")
            .map((line) => {
                const trimmed = line.trim();
                if (trimmed.includes("instagram.com/")) {
                    try {
                        const urlString = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
                        const url = new URL(urlString);
                        const pathParts = url.pathname.split("/").filter(Boolean);
                        if (pathParts.length > 0) return pathParts[0];
                    } catch (e) {
                        return trimmed;
                    }
                }
                return trimmed;
            })
            .filter((username) => username.length > 0)
            .map((username) => ({
                username,
                source: "manual_import",
            }));

        if (leads.length === 0) {
            toast.error("Please enter at least one lead");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await targetsApi.add(leads);
            toast.success(response.message || `Successfully added ${leads.length} leads`);
            setInput("");
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add leads:", error);
            toast.error("Failed to add leads. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Leads</DialogTitle>
                    <DialogDescription>
                        Enter usernames or Instagram profile links, one per line. They will be added to the pending queue.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Paste leads here..."
                        className="min-h-[300px] font-mono text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAddLeads} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add {input.split("\n").filter(l => l.trim()).length || ""} Leads
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
