"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
      <Loader2 className="h-8 w-8 animate-spin text-secondary" />
    </div>
  ),
});

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapter?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextChapter,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const playerRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLocked && playbackId) {
      setIsLoading(false);
    }
  }, [isLocked, playbackId]);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`);
        toast.success("Progress updated!");
        router.refresh();
      }

      if (nextChapter) {
        router.push(`/courses/${courseId}/chapters/${nextChapter}`);
      }
    } catch (error) {
      console.error("Progress update error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleError = (error: any) => {
    console.error("Video playback error:", error);
    
    if (error.detail?.hlsError) {
      const hlsError = error.detail.hlsError;
      
      // Handle buffer stalling specifically
      if (hlsError.type === 'bufferStalledError' || hlsError.details === 'bufferStalledError') {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          // Attempt to recover from buffer stall
          if (playerRef.current) {
            try {
              playerRef.current.currentTime = playerRef.current.currentTime + 0.1;
              toast.error("Recovering from buffer stall...");
            } catch (e) {
              console.error("Buffer recovery failed:", e);
            }
          }
        } else {
          toast.error("Video playback stalled. Please refresh the page.");
        }
        return;
      }

      // Handle other HLS errors
      switch (hlsError.type) {
        case 'networkError':
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            toast.error("Network error. Retrying...");
          } else {
            toast.error("Network error. Please check your connection and refresh the page.");
          }
          break;
        case 'mediaError':
          toast.error("Video playback error. Please try refreshing the page.");
          break;
        case 'muxError':
          toast.error("Streaming error. Please try again later.");
          break;
        default:
          toast.error("An error occurred while playing the video. Please try refreshing the page.");
      }
    } else {
      toast.error("An error occurred while playing the video. Please try refreshing the page.");
    }
  };

  return (
    <div className="relative aspect-video">
      {isLoading && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && playbackId && (
        <MuxPlayer
          ref={playerRef}
          title={title}
          className={cn(!isReady && "hidden")}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
          streamType="on-demand"
          metadata={{
            video_id: chapterId,
            video_title: title,
            viewer_user_id: courseId,
          }}
          minResolution="720p"
          maxResolution="1080p"
          preferPlayback="mse"
          debug={false}
          disablePictureInPicture
          style={{ height: "100%", maxWidth: "100%" }}
          onError={handleError}
          onLoadError={handleError}
          hlsConfig={{
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            lowLatencyMode: true,
            backBufferLength: 90,
            enableWorker: true,
            startLevel: -1,
            abrEwmaDefaultEstimate: 500000,
            testBandwidth: true,
            progressive: true,
            lowLatencyMode: true,
            maxStarvationDelay: 4,
            maxLoadingDelay: 4,
            // Additional buffer stalling prevention
            maxBufferHole: 0.3,
            highBufferWatchdogPeriod: 2,
            nudgeMaxRetry: 5,
            nudgeOffset: 0.1,
            // Improved error recovery
            enableWorker: true,
            startFragPrefetch: true,
            testBandwidth: true,
            progressive: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferHole: 0.5,
            maxStarvationDelay: 4,
            maxLoadingDelay: 4,
          }}
        />
      )}
    </div>
  );
};
