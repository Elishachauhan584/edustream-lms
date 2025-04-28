import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; attachmentId: string } }
) {
    try {
        // Get the authenticated user's ID from Clerk
        const { userId } = await auth();

        // If user is not authenticated, return unauthorized response
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if the user is the owner of the course
        const courseOwner = await db.course.findFirst({
            where: {
                id: params.courseId,
                userId: userId, // Ensure the user is the owner of the course
            },
        });

        // If the course owner is not found, return unauthorized response
        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete the attachment if the user is authorized
        const attachment = await db.attachment.delete({
            where: {
                id: params.attachmentId, // Correctly target the attachment by its ID
            },
        });

        // Return the deleted attachment in the response
        return NextResponse.json(attachment);
    } catch (error) {
        console.log("ATTACHMENT_DELETE", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
