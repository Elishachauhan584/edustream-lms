import React from "react";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from "@/components/info-card";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/sign-in");
    }

    const { completedCourses, coursesInProgress } = await getDashboardCourses(userId);

    return (
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard 
                    icon={Clock}
                    label="InProgress"
                    numberOfItems={coursesInProgress.length}
                /> 
                <InfoCard 
                    icon={CheckCircle}
                    label="Completed"
                    numberOfItems={completedCourses.length}
                    variant="success"
                /> 
                <CoursesList
                    items={[...coursesInProgress,...completedCourses]}
                />
            </div>
        </div>
    );
} 