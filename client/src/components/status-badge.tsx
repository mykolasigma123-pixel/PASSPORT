import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface StatusBadgeProps {
  active: boolean;
  size?: "default" | "sm" | "lg";
}

export function StatusBadge({ active, size = "default" }: StatusBadgeProps) {
  if (active) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
        data-testid="badge-status-active"
      >
        <Check className="w-3 h-3 mr-1" />
        Активен
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
      data-testid="badge-status-inactive"
    >
      <X className="w-3 h-3 mr-1" />
      Неактивен
    </Badge>
  );
}
