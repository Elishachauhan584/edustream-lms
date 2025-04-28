"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Video as VideoIcon } from "lucide-react";

import { Chapter, MuxData } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer } from "@/components/video-player";

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const FormSchema = z.object({
  videoUrl: z.string().min(1, "Video URL is required"),
});

type ChapterVideoFormValues = z.infer<typeof FormSchema>;

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm<ChapterVideoFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { 
      videoUrl: initialData.videoUrl || "" 
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit: SubmitHandler<ChapterVideoFormValues> = async (values) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        { videoUrl: values.videoUrl }
      );
      toast.success("Chapter video updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-6">
      <div className="flex items-center justify-between font-medium">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            "Cancel"
          ) : initialData.videoUrl ? (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add video
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-4">
          {initialData.videoUrl ? (
            <div className="relative aspect-video">
              <VideoPlayer 
                videoUrl={initialData.videoUrl} 
                playbackId={initialData.muxData?.playbackId || undefined}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
              <VideoIcon className="h-10 w-10 text-slate-500" />
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="chapterVideo"
                      onChange={(url) => {
                        if (url) {
                          field.onChange(url);
                          form.setValue("videoUrl", url, { shouldValidate: true });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={toggleEdit}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};