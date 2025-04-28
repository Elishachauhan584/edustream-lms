"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { File } from "lucide-react"; // Import File icon here
import { X } from "lucide-react"; // Import X icon for delete

import { Attachment } from "@prisma/client";
import { FileUpload } from "@/components/file-upload";

interface AttachmentFormProps {
  initialData: { attachments: Attachment[] };
  courseId: string;
}

const formSchema = z.object({
  name: z.string().optional(), // 👈 name is automatically derived from file
});

type AttachmentFormValues = z.infer<typeof formSchema>;

export const AttachmentForm = ({
  initialData,
  courseId,
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const form = useForm<AttachmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onFileUpload = async (url: string) => {
    try {
      const fileName = url.split("/").pop() || "attachment";

      // Directly submitting file URL and name
      await axios.post(`/api/courses/${courseId}/attachments`, {
        url,
        name: fileName,
      });

      toast.success("Attachment added");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  const onDelete = async (id: string) => {
    try{
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);  
      toast.success("Attachment deleted");
      router.refresh();
      } catch {
      toast.error("Something went wrong");
    } finally{
      setDeletingId(null);    }
   }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-6">
      <div className="font-medium flex items-center justify-between">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachments.length === 0 ? (
            <p className="text-sm mt-2 text-slate-500 italic">
              No attachments yet
            </p>
          ) : (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1"> {attachment.name}</p>
                  {deletingId !== attachment.id && (
                    <button 
                    onClickCapture={() =>onDelete(attachment.id)}
                      className="ml-auto hover:opacity-75 transition"
                      onClick={() => setDeletingId(attachment.id)} // Handle deletion
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <Form {...form}>
          <form className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={() => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      endpoint="courseAttachment"
                      onChange={(url) => {
                        if (typeof url === "string") {
                          form.setValue("name", url.split("/").pop() || "attachment"); // Extract file name
                          onFileUpload(url); // Direct submit with the URL
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-xs text-muted-foreground mt-4">
              Add anything your students might need to complete their course.
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
