import { auth } from "@clerk/nextjs/server"; 
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
    const { courseId } = await params;
    const { userId } = await auth();
    
    if (!userId) {
        return redirect("/sign-in");
    }

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    position: "asc",
                },
            },
        },
    });

    if (!course) {
        return redirect("/dashboard");
    }

    if (!course.chapters.length) {
        return redirect(`/courses/${course.id}/chapters`);
    }

    return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
};

export default CourseIdPage;
