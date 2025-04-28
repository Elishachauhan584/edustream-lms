import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // 1️⃣ Auth
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2️⃣ Parse + validate
    const { title } = await req.json();
    if (!title || typeof title !== "string") {
      return new NextResponse("Title is required", { status: 400 });
    }

    // 3️⃣ Compute position = next index
    const count = await db.chapter.count({
      where: { courseId: params.courseId },
    });

    // 4️⃣ Create
    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: params.courseId,
        position: count + 1, // <— required field
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error: unknown) {
    // Narrow the error into Error to access the message
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("[CHAPTER_CREATE_ERROR]", message);
    return new NextResponse(
      JSON.stringify({ error: message }),
      { status: 500 }
    );
  }
}
