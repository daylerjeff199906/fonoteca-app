import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export function FormSection({
  title,
  icon: Icon,
  children,
  className,
  headerClassName
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4 bg-card border rounded-lg p-6 shadow-sm", className)}>
      <div className={cn("flex items-center gap-2 pb-2 border-b border-muted/20", headerClassName)}>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
      </div>
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
