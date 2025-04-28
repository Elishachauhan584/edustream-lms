import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handlerAuth = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } }) // safer than "48MB"
    .middleware(() => handlerAuth())
    .onUploadComplete(() => {}),

  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(() => handlerAuth())
    .onUploadComplete(() => {}),

  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "512MB" } }) // also used "MB" instead of "GB"
    .middleware(() => handlerAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
