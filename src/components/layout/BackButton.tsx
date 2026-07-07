import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = "Retour", className }: Props) {
  const nav = useNavigate();
  const handle = () => {
    if (to) nav(to);
    else if (window.history.length > 1) nav(-1);
    else nav("/");
  };
  return (
    <button
      type="button"
      onClick={handle}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3",
        className,
      )}
      aria-label={label}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
