import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Mux from "@mux/mux-node"; // Changed to default import



// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      }
    });
    
    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          ChapterId: params.chapterId,
        }
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      },
    });

    const publishedChapterInCourse = await db.chapter.findMany({ 
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { videoUrl, isPublished, ...rest } = await req.json();

    const chapter = await db.chapter.findUnique({
      where: { 
        id: params.chapterId, 
        courseId: params.courseId 
      },
      include: {
        muxData: true
      }
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    if (videoUrl) {
      if (chapter.muxData) {
        try {
          await mux.video.assets.delete(chapter.muxData.assetId);
          await db.muxData.delete({ 
            where: { id: chapter.muxData.id } 
          });
        } catch (error) {
          console.error("[MUX_DELETE_ERROR]", error);
        }
      }

      const asset = await mux.video.assets.create({
        inputs: [{ url: videoUrl }],
        playback_policy: ["public"],
      });

      if (!asset.playback_ids?.[0]?.id) {
        throw new Error("No playback ID received from Mux");
      }

      await db.muxData.create({
        data: {
          ChapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids[0].id,
        },
      });
    }

    const updatedChapter = await db.chapter.update({
      where: { 
        id: params.chapterId, 
        courseId: params.courseId 
      },
      data: {
        ...rest,
        videoUrl: videoUrl ?? chapter.videoUrl,
        isPublished: isPublished ?? chapter.isPublished,
      },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error("[CHAPTER_UPDATE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}