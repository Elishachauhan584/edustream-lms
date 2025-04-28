"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
  chapterId?: string;
}

export const Actions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (chapterId) {
        // Chapter-level publish/unpublish
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/${
            isPublished ? "unpublished" : "published"
          }`
        );
        toast.success(
          isPublished ? "Chapter unpublished" : "Chapter published"
        );
      } else {
        // Course-level publish/unpublish
        await axios.patch(
          `/api/courses/${courseId}/${isPublished ? "unpublished" : "published"}`,
          { isPublished: !isPublished }
        );
        toast.success(
          isPublished ? "Course unpublished" : "Course published"
        );
        confetti.onOpen();
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (chapterId) {
        // Chapter delete
        await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
        toast.success("Chapter deleted");
        router.push(`/teacher/courses/${courseId}`);
      } else {
        // Course delete
        await axios.delete(`/api/courses/${courseId}`);
        toast.success("Course deleted");
        router.push(`/teacher/courses`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished
          ? `Unpublish ${chapterId ? "Chapter" : "Course"}`
          : `Publish ${chapterId ? "Chapter" : "Course"}`}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
