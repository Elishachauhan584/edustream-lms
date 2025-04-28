import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { redirect } from "next/navigation";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";

import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";

interface CourseIdPageProps {
  params: { courseId: string };
}

const CourseIdPage = async ({
  params: { courseId },
}: CourseIdPageProps) => {
  if (!courseId) return redirect("/");

  const { userId } = await auth();
  if (!userId) return redirect("/");

  const course = await db.course.findUnique({
    where: { id: courseId, userId },
    include: {
      chapters: { orderBy: { position: "asc" } },
      attachment: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!course) return redirect("/");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((ch) => ch.isPublished),
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {/* Course-level unpublished banner */}
      {!course.isPublished && (
        <Banner label="This course is unpublished. It will not be visible to students." />
      )}

      {/* Chapter-level unpublished banners */}
      {course.chapters.map(
        (chapter) =>
          !chapter.isPublished && (
            <Banner
              key={chapter.id}
              variant="warning"
              label="This chapter is unpublished and won't appear in the course."
            />
          )
      )}

      <div className="p-6">
        {/* Header + course-level Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={courseId}
            isPublished={course.isPublished}
          />
        </div>

        {/* Course details forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </div>

        {/* Chapter list with chapter-level Actions */}
        <div className="space-y-6 mt-16">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={ListChecks} />
            <h2 className="text-xl">Course Chapters</h2>
          </div>
          {course.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm"
            >
              <div>
                <h3 className="text-lg font-semibold">{chapter.title}</h3>
              </div>
              <Actions
                disabled={false}
                courseId={courseId}
                chapterId={chapter.id}
                isPublished={chapter.isPublished}
              />
            </div>
          ))}
          <ChaptersForm initialData={course} courseId={course.id} />

          {/* Price form */}
          <div className="flex items-center gap-x-2">
            <IconBadge icon={CircleDollarSign} />
            <h2 className="text-xl">Sell your course</h2>
          </div>
          <PriceForm initialData={course} courseId={course.id} />

          {/* Attachments */}
          <div className="flex items-center gap-x-2">
            <IconBadge icon={File} />
            <h2 className="text-xl">Resources & Attachments</h2>
          </div>
          <AttachmentForm
            initialData={{ attachments: course.attachment }}
            courseId={course.id}
          />
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
