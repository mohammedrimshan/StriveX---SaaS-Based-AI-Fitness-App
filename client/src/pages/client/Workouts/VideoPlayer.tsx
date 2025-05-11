import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateWorkoutVideoProgress } from "@/hooks/progress/useUpdateWorkoutVideoProgress";
import { RootState } from "@/store/store";
import { updateExerciseProgress, addCompletedExercise } from "@/store/slices/workoutProgress.slice";

interface VideoPlayerProps {
  videoUrl?: string | string[];
  exerciseName: string;
  exerciseDescription: string;
  workoutId: string;
  exerciseId: string;
  completedExercises: string[];
  onComplete: (exerciseId: string) => void;
  // New prop for auto-advancing
  onNext?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  exerciseName,
  exerciseDescription,
  workoutId,
  exerciseId,
  completedExercises,
  onComplete,
  onNext,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dispatch = useDispatch();
  const { mutate: updateVideoProgress } = useUpdateWorkoutVideoProgress();
  const client = useSelector((state: RootState) => state.client.client);
  const userId = client?.id;

  const selectedVideoUrl = Array.isArray(videoUrl) ? videoUrl[0] : videoUrl;
  
  // Check if this exercise is already completed
  useEffect(() => {
    if (completedExercises.includes(exerciseId)) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [exerciseId, completedExercises]);
  
  // Auto-advance to next video if this one is already completed
  useEffect(() => {
    if (isCompleted && onNext) {
      // Small delay before moving to next video to avoid immediate jumps
      const timer = setTimeout(() => {
        onNext();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onNext]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const updateProgress = () => {
      if (videoRef.current && userId) {
        const duration = videoRef.current.duration;
        const currentTime = videoRef.current.currentTime;
        if (duration && currentTime) {
          const videoProgress = Math.round((currentTime / duration) * 100);
          setProgress(videoProgress);

          if (videoProgress % 5 === 0 || videoProgress >= 95) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              const status = videoProgress >= 95 ? "Completed" : "In Progress";

              // Update Redux store
              dispatch(
                updateExerciseProgress({
                  workoutId,
                  exerciseId,
                  videoProgress,
                  status,
                })
              );

              // Sync with backend
              updateVideoProgress(
                {
                  workoutId,
                  exerciseId,
                  videoProgress,
                  status,
                  userId,
                  completedExercises:
                    videoProgress >= 95
                      ? [...completedExercises, exerciseId].filter((id, index, self) => self.indexOf(id) === index)
                      : completedExercises,
                },
                {
                  onError: (error) => {
                    console.error("Failed to update video progress:", error);
                  },
                  onSuccess: () => {
                    if (status === "Completed") {
                      dispatch(addCompletedExercise({ workoutId, exerciseId }));
                      onComplete(exerciseId);
                      setIsCompleted(true);
                      
                      // Auto-advance to the next video when complete
                      if (onNext) {
                        // Small delay to show completion
                        setTimeout(() => {
                          onNext();
                        }, 1000);
                      }
                    }
                  },
                }
              );
            }, 500); // Debounce for 500ms
          }
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("timeupdate", updateProgress);
      
      // If video ends, also handle completion
      video.addEventListener("ended", () => {
        if (!isCompleted) {
          dispatch(addCompletedExercise({ workoutId, exerciseId }));
          onComplete(exerciseId);
          setIsCompleted(true);
          
          // Auto-advance to the next video
          if (onNext) {
            setTimeout(() => {
              onNext();
            }, 1000);
          }
        }
      });
      
      return () => {
        video.removeEventListener("timeupdate", updateProgress);
        video.removeEventListener("ended", () => {});
        clearTimeout(timeout);
      };
    }
  }, [workoutId, exerciseId, onComplete, updateVideoProgress, userId, completedExercises, dispatch, isCompleted, onNext]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
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

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl">
      <div className="relative bg-black aspect-video w-full">
        {selectedVideoUrl ? (
          <video
            ref={videoRef}
            src={selectedVideoUrl}
            className="w-full h-full object-cover"
            poster="/placeholder.svg"
            loop
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