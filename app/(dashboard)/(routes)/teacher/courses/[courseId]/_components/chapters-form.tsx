"use client";

import * as z from "zod";
import axios from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { Chapter, Course } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { ChaptersList } from "./chapters-list";

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const FormSchema = z.object({
  title: z.string().min(1, "Chapter title is required"),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "" },
  });

  // Chapter creation handler
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      // Optimistically updating the UI by adding the chapter immediately
      await axios.post(`/api/courses/${courseId}/chapters`, values);

      
      toast.success("Chapter created");
      setIsCreating(false);
      // Optionally, update the state with newChapter data without waiting for page refresh
      router.refresh();
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Something went wrong while creating the chapter");
    }
  };

  // Reorder chapters handler
  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      const res = await axios.put(
        `/api/courses/${courseId}/chapters/reorder`,
        { list: updateData }
      );
      if (res.status !== 200) {
        throw new Error(`HTTP ${res.status}`);
      }
      toast.success("Chapters reordered successfully");
      router.refresh();
    } catch (err) {
      console.error("Reorder error:", err);
      toast.error("Something went wrong while reordering chapters");
    } finally {
      setIsUpdating(false);
    }
  };

  // Edit chapter handler
  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-6">
      <div className="flex justify-between items-center font-medium">
        <span>Course chapters</span>
        <Button onClick={() => setIsCreating((c) => !c)} variant="ghost">
          {isCreating ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a chapter
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="Chapter title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              Create
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div className={cn("mt-4", !initialData.chapters.length && "text-slate-500 italic")}>
          {!initialData.chapters.length ? (
            "No Chapters"
          ) : (
            <ChaptersList
              onEdit={onEdit}
              onReorder={onReorder}
              items={initialData.chapters}
            />
          )}
        </div>
      )}

      {isUpdating && <p className="mt-2 text-sm italic text-blue-500">Saving changes…</p>}
      {!isCreating && (
        <p className="mt-2 text-xs text-muted-foreground">Drag and drop to reorder chapters.</p>
      )}
    </div>
  );
};
