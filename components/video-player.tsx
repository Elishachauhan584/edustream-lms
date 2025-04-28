"use client";

interface VideoPlayerProps {
  videoUrl: string;
  playbackId?: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
  <video controls className="w-full aspect-video rounded-xl shadow-lg">
    <source src={videoUrl} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

  );
};
