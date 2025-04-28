import { auth } from "@clerk/nextjs/server";
import { getChapter } from "@/actions/get-chapter";
import { redirect } from "next/navigation";
import { Banner } from "@/components/banner";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { File } from "lucide-react";
import { CourseProgressButton } from "./_components/course-progress-button";
import AutoRefresh from "./_components/auto-refresh";

const ChapterIdPage = async ({ params }: { params: { courseId: string; chapterId: string }; }) => {
    const { courseId, chapterId } = await params;
    const { userId } = await auth();
    if (!userId) {
        return redirect("/");
    }

    const {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
    } = await getChapter({
        userId,
        chapterId,
        courseId,
    });

    if (!chapter || !course) {
        return redirect("/");
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
        <div>
            <AutoRefresh />
            {userProgress?.isCompleted && (
                <Banner
                    variant="success"
                    label="You already completed this chapter."
                />
            )}
            {isLocked && (
                <Banner
                    variant="warning"
                    label="You need to purchase this course to watch this chapter."
                />
            )}
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="sticky top-20 z-10 bg-white p-2 rounded shadow">
                    <VideoPlayer
                        chapterId={params.chapterId}
                        title={chapter.title}
                        courseId={params.courseId}
                        nextChapter={nextChapter?.id}
                        playbackId={muxData?.playbackId ?? ""}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">
                            {chapter.title}
                        </h2>
                        {purchase ? (
                            <CourseProgressButton
                                chapterId={params.chapterId}
                                courseId={params.courseId}
                                nextChapterId={nextChapter?.id}
                                isCompleted={!!userProgress?.isCompleted}
                            />
                        ) : (
                            <CourseEnrollButton
                                courseId={params.courseId}
                                price={course.price!}
                            />
                        )}
                    </div>
                    <Separator />
                    <div>
                        <Preview value={chapter.description!} />
                    </div>
                    {!!attachments.length && (
                        <>
                            <Separator />
                            <div className="p-4">
                                {attachments.map((attachment) => (
                                    <a
                                        href={attachment.url}
                                        target="_blank"
                                        key={attachment.id}
                                        className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                    >
                                        <File />
                                        <p className="line-clamp-1">
                                            {attachment.name}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChapterIdPage;