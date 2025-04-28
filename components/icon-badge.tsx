import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Background variants for styling
const backgroundVariants = cva(
  "rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-sky-100",
        success: "bg-emerald-100",
      },
      
      size: {
        default: "p-2",
        sm: "p-1",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Icon variants for styling
const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-sky-700",
      success: "text-emerald-700",
    },
    size: {
      default: "h-8 w-8",
      sm: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// Extracting the types for the background and icon variants
type backgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type iconVariantsProps = VariantProps<typeof iconVariants>;

// Icon badge component props definition
interface IconBadgeProps extends backgroundVariantsProps, iconVariantsProps {
  icon: LucideIcon; // This will accept any Lucide icon
}

export const IconBadge = ({
  icon: Icon, // Destructuring the icon prop
  variant,
  size,
}: IconBadgeProps) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariants({ variant, size }))} />
    </div>
  );
};
