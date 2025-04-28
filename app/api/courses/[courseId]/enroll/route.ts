import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId,
        },
      },
    });

    if (purchase) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    // Create purchase record for free course
    await db.purchase.create({
      data: {
        userId: user.id,
        courseId: params.courseId,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[COURSE_ID_ENROLL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 