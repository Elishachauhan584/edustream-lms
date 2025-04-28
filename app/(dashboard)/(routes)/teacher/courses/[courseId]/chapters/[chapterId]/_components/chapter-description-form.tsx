"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Chapter } from "@prisma/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

// Solution 1: Dynamic import with SSR disabled (recommended)
const Editor = dynamic<EditorProps>(
  () => import("@/components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] bg-slate-100 rounded-md flex items-center justify-center">
        <p>Loading editor...</p>
      </div>
    ),
  }
);

const FormSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required",
  }),
});

interface ChapterDescriptionFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

export const ChapterDescriptionForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterDescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // For client-side check
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const methods = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid, errors },
    watch,
    setValue,
    reset,
  } = methods;

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);

    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated successfully");
      reset({ description: values.description });
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleEditorChange = (content: string) => {
    setValue("description", content, { shouldValidate: true });
  };

  if (!isMounted) {
    return (
      <div className="mt-6 border bg-slate-100 rounded-md p-6">
        <div className="font-medium flex items-center justify-between">
          Chapter description
          <Button variant="ghost" disabled>
            <Pencil className="h-4 w-4 mr-2" />
            Edit description
          </Button>
        </div>
        <div className="text-sm mt-2 text-slate-500 italic">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-6">
      <div className="font-medium flex items-center justify-between">
        Chapter description
        <Button
          onClick={toggleEdit}
          variant="ghost"
          disabled={isSubmitting}
        >
          {isEditing ? (
            "Cancel"
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit description
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <div
          className={cn(
            "text-sm mt-2 prose max-w-full",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {initialData.description ? (
            <div dangerouslySetInnerHTML={{ __html: initialData.description }} />
          ) : (
            "No description provided"
          )}
        </div>
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="relative">
              <Editor
                value={watch("description")}
                onChange={handleEditorChange}
                editable={!isSubmitting}
              />
              {errors.description && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};