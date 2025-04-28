"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface CourseSidebarItemProps {
  id: string;
  label: string;
  isCompleted?: boolean;
  courseId: string;
  isLocked?: boolean;
}

export const CourseSidebarItem = ({
  id,
  label,
  isCompleted,
  courseId,
  isLocked,
}: CourseSidebarItemProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isCompleted && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700",
        isLocked && "text-slate-400 hover:text-slate-400 hover:bg-slate-300/20"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        {isLocked ? (
          <Lock
            size={22}
            className="text-slate-400"
          />
        ) : isCompleted ? (
          <CheckCircle
            size={22}
            className="text-sky-700"
          />
        ) : (
          <div
            className="h-5 w-5 border-2 border-slate-500 rounded-full"
          />
        )}
        {label}
      </div>
      <div className={cn(
        "ml-auto opacity-0 border-2 border-sky-700 h-full transition-all",
        isCompleted && "opacity-100"
      )} />
    </button>
  );
};