import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useUpdateWorkoutVideoProgress } from "@/hooks/progress/useUpdateWorkoutVideoProgress";

interface VideoPlayerProps {
  videoUrl?: string | string[];
  exerciseName: string;
  exerciseDescription: string;
  workoutId: string;
  exerciseId: string;
  userId: string;
  completedExercises: string[];
  onComplete: (exerciseId: string) => void;
  onNext?: () => void;
  workout: { exercises: any[]; duration: number; difficulty: string };
  onProgressUpdate?: (progress: number) => void;
  initialProgress?: number;
}

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  exerciseName,
  exerciseDescription,
  workoutId,
  exerciseId,
  userId,
  completedExercises,
  onComplete,
  onNext,
  onProgressUpdate,
  initialProgress = 0,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mutate: updateVideoProgress } = useUpdateWorkoutVideoProgress();
  const selectedVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  const hasSetInitialTime = useRef(false);

  useEffect(() => {
    if (!isValidObjectId(exerciseId)) {
      console.error("Invalid exerciseId in VideoPlayer:", exerciseId);
      return;
    }

    if (completedExercises.includes(exerciseId)) {
      setIsCompleted(true);
      setProgress(100);
      onProgressUpdate?.(100);
    } else {
      setIsCompleted(false);
      setProgress(initialProgress);
      onProgressUpdate?.(initialProgress);
    }
    // Reset initial time flag when exerciseId or initialProgress changes
    hasSetInitialTime.current = false;
  }, [exerciseId, completedExercises, onProgressUpdate, initialProgress]);

  useEffect(() => {
    if (isCompleted && onNext) {
      const timer = setTimeout(() => {
        onNext();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onNext]);

  useEffect(() => {
    if (!isValidObjectId(exerciseId)) {
      console.error("Skipping updateVideoProgress due to invalid exerciseId:", exerciseId);
      return;
    }

    if (!userId || !workoutId) {
      console.error("Missing userId or workoutId for progress update");
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const setInitialTime = () => {
      if (!hasSetInitialTime.current && initialProgress > 0 && !isCompleted) {
        const duration = video.duration;
        if (duration && !isNaN(duration)) {
          const startTime = (initialProgress / 100) * duration;
          video.currentTime = startTime;
          hasSetInitialTime.current = true;
          console.log(`Set video start time to ${startTime}s (${initialProgress}%)`);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setInitialTime();
    };

    let timeout: NodeJS.Timeout;
    const updateProgress = () => {
      if (video && userId && !isCompleted) {
        const duration = video.duration;
        const currentTime = video.currentTime;
        if (duration && currentTime && !isNaN(duration) && !isNaN(currentTime)) {
          const videoProgress = Math.round((currentTime / duration) * 100);
          setProgress(videoProgress);
          onProgressUpdate?.(videoProgress);

          if ((videoProgress % 10 === 0 || videoProgress >= 90) && !isCompleted) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              const status = videoProgress >= 90 ? "Completed" : "In Progress";
              updateVideoProgress(
                {
                  workoutId,
                  exerciseId,
                  videoProgress,
                  status,
                  userId,
                  completedExercises: videoProgress >= 90
                    ? [...completedExercises, exerciseId].filter(
                        (id, index, self) => self.indexOf(id) === index && isValidObjectId(id)
                      )
                    : completedExercises,
                },
                {
                  onError: (error) => {
                    console.error("Failed to update video progress:", error);
                  },
                  onSuccess: () => {
                    if (status === "Completed") {
                      onComplete(exerciseId);
                      setIsCompleted(true);
                      if (video) {
                        video.pause();
                        video.loop = false;
                        setIsPlaying(false);
                      }
                      if (onNext) {
                        setTimeout(() => {
                          onNext();
                        }, 1000);
                      }
                    }
                  },
                }
              );
            }, 300);
          }
        }
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", () => {
      if (!isCompleted) {
        updateVideoProgress(
          {
            workoutId,
            exerciseId,
            videoProgress: 100,
            status: "Completed",
            userId,
            completedExercises: [...completedExercises, exerciseId].filter(
              (id, index, self) => self.indexOf(id) === index && isValidObjectId(id)
            ),
          },
          {
            onError: (error) => {
              console.error("Failed to update video progress:", error);
            },
            onSuccess: () => {
              onComplete(exerciseId);
              setIsCompleted(true);
              video.pause();
              video.loop = false;
              setIsPlaying(false);
              if (onNext) {
                setTimeout(() => {
                  onNext();
                }, 1000);
              }
            },
          }
        );
      }
    });

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", () => {});
      clearTimeout(timeout);
    };
  }, [workoutId, exerciseId, onComplete, updateVideoProgress, userId, completedExercises, isCompleted, onNext, onProgressUpdate, initialProgress]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        // Update progress in backend when pausing
        const duration = videoRef.current.duration;
        const currentTime = videoRef.current.currentTime;
        if (duration && currentTime && !isNaN(duration) && !isNaN(currentTime) && !isCompleted) {
          const videoProgress = Math.round((currentTime / duration) * 100);
          setProgress(videoProgress);
          onProgressUpdate?.(videoProgress);
          updateVideoProgress(
            {
              workoutId,
              exerciseId,
              videoProgress,
              status: videoProgress >= 90 ? "Completed" : "In Progress",
              userId,
              completedExercises: videoProgress >= 90
                ? [...completedExercises, exerciseId].filter(
                    (id, index, self) => self.indexOf(id) === index && isValidObjectId(id)
                  )
                : completedExercises,
            },
  {
              onError: (error) => {
                console.error("Failed to update video progress on pause:", error);
              },
              onSuccess: () => {
                console.log(`Video progress updated to ${videoProgress}% on pause`);
                if (videoProgress >= 90) {
                  onComplete(exerciseId);
                  setIsCompleted(true);
                  videoRef.current?.pause();
                  videoRef.current!.loop = false;
                  setIsPlaying(false);
                  if (onNext) {
                    setTimeout(() => {
                      onNext();
                    }, 1000);
                  }
                }
              },
            }
          );
        }
      } else {
        // Ensure video starts at the correct position
        if (!hasSetInitialTime.current && initialProgress > 0 && !isCompleted) {
          const duration = videoRef.current.duration;
          if (duration && !isNaN(duration)) {
            const startTime = (initialProgress / 100) * duration;
            videoRef.current.currentTime = startTime;
            hasSetInitialTime.current = true;
            console.log(`Set video start time to ${startTime}s (${initialProgress}%) on play`);
          }
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  if (!userId) {
    return <div>Please log in to view the video player.</div>;
  }

  if (!isValidObjectId(exerciseId)) {
    return <div>Error: Invalid exercise ID.</div>;
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl">
      <div className="relative bg-black aspect-video w-full">
        {selectedVideoUrl ? (
          <video
            ref={videoRef}
            src={selectedVideoUrl}
            className="w-full h-full object-cover"
            poster="/placeholder.svg"
            loop={false}
            onClick={handlePlayPause}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-violet-100">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-200 flex items-center justify-center">
                <Play size={36} className="text-violet-700 ml-1" />
              </div>
              <p className="text-lg text-violet-800">Video not available</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-1" />
                )}
              </button>
              <button
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4 text-white" />
              </button>
            </div>

            <button
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
              onClick={handleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
          <div className="mt-2 text-white text-sm">Progress: {progress}%</div>
        </div>
      </div>
      <div className="p-4 bg-white">
        <h2 className="text-xl font-bold text-violet-900 mb-1">{exerciseName}</h2>
        <p className="text-gray-700">{exerciseDescription}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;