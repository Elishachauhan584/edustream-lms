import { LucideIcon } from "lucide-react";
import { IconBadge } from "./icon-badge";
import { memo } from "react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  numberOfItems: number;
  variant?: "default" | "success";
}

export const InfoCard = memo(({
  icon: Icon,
  label,
  numberOfItems,
  variant
}: InfoCardProps) => {
  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3">
      <IconBadge
        icon={Icon}
        variant={variant}
      />
      <div>
        <p className="font-medium">
          {label}
        </p>
        <p className="text-gray-500 text-sm">
          {numberOfItems} {numberOfItems === 1 ? "Course" : "Courses"}
        </p>
      </div>
    </div>
  )
});

InfoCard.displayName = "InfoCard"; 