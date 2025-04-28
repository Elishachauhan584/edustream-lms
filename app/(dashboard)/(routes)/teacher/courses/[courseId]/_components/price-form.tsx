"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import React from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PriceFormProps {
  initialData: Course;
  courseId: string;
}

const FormSchema = z.object({
  price: z.coerce.number({
    required_error: "Price is required",
    invalid_type_error: "Must be a number",
  }).min(0, "Minimum price is 0"),
  isFree: z.boolean().optional(),
});

export const PriceForm = ({
  initialData,
  courseId,
}: PriceFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      price: initialData?.price ?? 0,
      isFree: initialData?.price === 0,
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, isValid },
  } = form;

  const isFree = watch("isFree");

  // If 'Free' is checked, always set price to 0
  React.useEffect(() => {
    if (isFree) {
      setValue("price", 0);
    }
  }, [isFree, setValue]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, {
        price: values.isFree ? 0 : values.price,
      });
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-6">
      <div className="font-medium flex items-center justify-between">
        Course Price
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit price
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.price && "text-slate-500 italic"
          )}
        >
          {initialData.price === 0 ? "Free" : `₹${initialData.price}`}
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <span>This course is free</span>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting || isFree}
                      placeholder="Set a price for your course"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
