"use client";

import { cn } from "@/lib/utils";

interface CourseProgressProps {
    value: number;
    variant?: "default" | "success";
    size?: "default" | "sm";
};

const colorByVariant = {
    default: "text-sky-700",
    success: "text-emerald-700",
}
const sizeByVariant = {
    default: "text-sm",
    sm: "text-xs",
}
export const CourseProgress = ({
    value,
    variant,
    size,
 }: CourseProgressProps ) => {
    return (
        <div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className={cn(
                "h-2.5 rounded-full",
                colorByVariant[variant || "default"]
              )}
              style={{ width: `${value}%` }}
            />
          </div>
          <p className={cn(
            "font-medium mt-2 text-sky-700",
            sizeByVariant[size || "default"],
            colorByVariant[variant || "default"],
          )}>
            {Math.round(value)}% Complete
          </p>
        </div>
    )
}