// app/api/courses/[courseId]/chapters/reorder/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  // 1) Extract Clerk session
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2) Parse the JSON body
  const { list } = (await req.json()) as { list: { id: string; position: number }[] };

  // 3) Confirm ownership
  const ownerCourse = await db.course.findUnique({
    where: { id: params.courseId, userId },
  });
  if (!ownerCourse) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 4) Update positions
  for (const item of list) {
    await db.chapter.update({
      where: { id: item.id },
      data: { position: item.position },
    });
  }

  // 5) Success
  return new NextResponse("Success", { status: 200 });
}
