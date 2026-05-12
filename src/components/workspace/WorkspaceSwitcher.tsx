import { useState } from "react";
import { useFinance } from "@/lib/finance/store";
import { Button } from "@/components/ui/button";
import { ChevronDown, Briefcase, User, FolderKanban } from "lucide-react";
import { WorkspaceDialog } from "./WorkspaceDialog";
import { WorkspaceKind } from "@/lib/finance/types";

const iconFor = (k: WorkspaceKind) =>
  k === "personal" ? User : k === "business" ? Briefcase : FolderKanban;

export function WorkspaceSwitcher() {
  const { currentWorkspace } = useFinance();
  const [open, setOpen] = useState(false);
  const Icon = iconFor(currentWorkspace.kind);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 max-w-[200px] gap-2 px-2.5 hover:bg-secondary/70"
      >
        <span className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary-foreground" />
        </span>
        <span className="flex-1 text-left min-w-0">
          <span className="block text-sm font-semibold truncate leading-tight">{currentWorkspace.name}</span>
          <span className="block text-[10px] text-muted-foreground leading-tight">{currentWorkspace.currency}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </Button>
      <WorkspaceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
