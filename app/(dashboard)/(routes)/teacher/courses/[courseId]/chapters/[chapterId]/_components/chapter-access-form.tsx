"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Chapter } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";

// **Fix 1**: Ensure `isFree` is strictly boolean
const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  isFree: z.boolean().default(false), // ✅ Ensures it's always boolean
});

type FormValues = z.infer<typeof formSchema>;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

// **Fix 2**: Ensure correct dynamic import handling
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

interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

export const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterAccessFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData.description || "",
      isFree: initialData.isFree ?? false, // ✅ Ensures it's always a boolean value
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isValid, isSubmitting: formIsSubmitting },
    reset,
    control,
    watch,
  } = methods;

  // **Fix 3**: Explicitly define `SubmitHandler<FormValues>`
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        description: data.description,
        isFree: data.isFree,
      });
      toast.success("Chapter updated successfully!");
      reset(data);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const handleEditorChange = (value: string) => {
    setValue("description", value, { shouldValidate: true });
  }

  if (!isMounted) {
    return (
      <div className="mt-6 border bg-slate-100 rounded-md p-6">
        <div className="font-medium flex items-center justify-between">
          Chapter description
          <Button variant="ghost" disabled>
            <Pencil className="h-4 w-4 mr-2" />
            chapter access setting
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
       chapter access 
        <Button onClick={toggleEdit} variant="ghost" disabled={formIsSubmitting}>
          {isEditing ? (
            "Cancel"
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit access
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <div
          className={cn(
            "text-sm mt-2 prose max-w-full",
            !initialData.isFree&& "text-slate-500 italic"
          )}
        >
          {initialData.isFree ? (
          <> This chapter is free for preview.</>
          ) : (
            <>This chapter is not free.</>
          )}
        </div>
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="relative">
              <Editor
                value={watch("description")}
                onChange={handleEditorChange}
                editable={!formIsSubmitting}
              />
              {methods.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {methods.formState.errors.description.message}
                </p>
              )}
            </div>

            <FormField
              control={control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      This chapter is free and can be accessed without purchasing
                      the course.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={!isValid || formIsSubmitting}>
                {formIsSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};