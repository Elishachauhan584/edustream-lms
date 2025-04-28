"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CourseEnrollButtonProps {
    price: number;
    courseId: string;
}

export const CourseEnrollButton = ({
    price,
    courseId,
}: CourseEnrollButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onClick = async () => {
        try {
            setIsLoading(true);
            if (price === 0) {
                // Handle free course enrollment
                await axios.post(`/api/courses/${courseId}/enroll`);
                toast.success("Successfully enrolled in the course!");
                router.refresh();
            } else {
                // Handle paid course checkout
                const response = await axios.post(`/api/courses/${courseId}/checkout`);
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Enrollment error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            size="sm"
            className="w-full md:w-auto"
        >
            {price === 0 ? "Enroll for Free" : formatPrice(price)}
        </Button>
    );
};