"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { CheckCircle, Loader2 } from "lucide-react";

interface CourseProgressButtonProps {
    chapterId: string;
    courseId: string;
    nextChapterId?: string;
    isCompleted?: boolean;
}

export const CourseProgressButton = ({
    chapterId,
    courseId,
    nextChapterId,
    isCompleted
}: CourseProgressButtonProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isCompleted) {
                await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`);
                toast.success("Progress updated!");
                router.refresh();
            }

            if (nextChapterId) {
                router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            className="w-full md:w-auto"
            variant={isCompleted ? "outline" : "secondary"}
        >
            {isCompleted ? "Not completed" : "Mark as complete"}
            {isLoading && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            )}
        </Button>
    )
} 