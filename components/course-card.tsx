"use client";

import { cn } from "@/lib/utils";
import { ImageIcon, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/courses/${id}`);
  };

  return (
    <div
      onClick={onClick}
      className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full cursor-pointer"
    >
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        {imageUrl ? (
          <Image
            fill
            className="object-cover"
            alt={title}
            src={imageUrl}
          />
        ) : (
          <div className="h-full w-full bg-slate-200 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        )}
      </div>
      <div className="flex flex-col pt-2">
        <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
          {title}
        </div>
        <p className="text-xs text-muted-foreground">
          {category}
        </p>
        <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
          <div className="flex items-center gap-x-1 text-slate-500">
            <Lock className="h-4 w-4" />
            <span>
              {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
            </span>
          </div>
        </div>
        {progress !== null ? (
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-sky-700 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <p className="text-md md:text-sm font-medium text-slate-700">
            {price ? `$${price}` : "Free"}
          </p>
        )}
      </div>
    </div>
  );
};
