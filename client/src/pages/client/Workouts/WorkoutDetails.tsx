import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, BarChart3, Play, Dumbbell } from "lucide-react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import ExerciseItem from "./ExerciseItem";
import VideoPlayer from "./VideoPlayer";
import MusicPlayer from "./MusicPlayer";
import ProgressTracker from "./ProgressTracker";
import WorkoutCompletionModal from "@/components/modals/WorkoutCompletionModal";
import { motion } from "framer-motion";
import { useAllWorkouts } from "@/hooks/client/useAllWorkouts";
import { useGetUserWorkoutVideoProgress } from "@/hooks/progress/userSingleVideoProgress";
import { useUpdateWorkoutVideoProgress } from "@/hooks/progress/useUpdateWorkoutVideoProgress";
import { useCreateWorkoutProgress } from "@/hooks/progress/useCreateWorkoutProgress";
import { useUpdateWorkoutProgress } from "@/hooks/progress/useUpdateWorkoutProgress";
import { useGetUserWorkoutProgress } from "@/hooks/progress/useGetUserWorkoutProgress";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WorkoutDetailsPro, Exercise } from "@/types/Workouts";
import {
  IWorkoutProgressEntity,
  IWorkoutVideoProgressEntity,
} from "@/services/progress/workoutProgressService";
import { useQueryClient } from "@tanstack/react-query";

interface WorkoutProgressType {
  _id?: string;
  exerciseProgress: {
    exerciseId: string;
    videoProgress: number;
    status: "Not Started" | "In Progress" | "Completed";
    lastUpdated?: Date;
  }[];
  completedExercises: string[];
}

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgressType>({
    exerciseProgress: [],
    completedExercises: [],
  });
  const [progressId, setProgressId] = useState<string | null>(null);
  const [existingWorkoutProgress, setExistingWorkoutProgress] =
    useState<IWorkoutProgressEntity | null>(null);
  const [currentVideoProgress, setCurrentVideoProgress] = useState<number>(0);

  const client = useSelector((state: RootState) => state.client.client);
  const userId = client?.id;

  const { data: paginatedData, isLoading, isError } = useAllWorkouts(1, 10, {});
  const { data: videoProgressData, isLoading: isVideoProgressLoading } =
    useGetUserWorkoutVideoProgress(userId || "");
  const { data: workoutProgressData, isLoading: isWorkoutProgressLoading } =
    useGetUserWorkoutProgress(userId || "");
  const { mutate: updateVideoProgress, isPaused: isUpdatingVideoProgress } =
    useUpdateWorkoutVideoProgress();
  const { mutate: createWorkoutProgress, isPaused: isCreatingWorkoutProgress } =
    useCreateWorkoutProgress();
  const { mutate: updateWorkoutProgress } = useUpdateWorkoutProgress();

  useEffect(() => {
    if (!userId || !id || !isValidObjectId(userId) || !isValidObjectId(id)) {
      console.error("Invalid userId or workoutId:", { userId, workoutId: id });
      setErrorMessage("Invalid user or workout ID.");
      return;
    }

    const socketInstance = io("https://api.strivex.rimshan.in");
    socketInstance.on("connect", () => {
      socketInstance.emit("register", { userId, role: "client" });
    });

    
    socketInstance.on(
      "workoutCompleted",
      (data: { userId: string; workoutId: string }) => {
        console.log("Socket: workoutCompleted event received", data);
        if (
          data.userId === userId &&
          data.workoutId === id &&
          !workoutCompleted
        ) {
          setWorkoutCompleted(true);
          setShowCompletionModal(true);
        }
      }
    );
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, id, workoutCompleted]);

  useEffect(() => {
    if (
      !paginatedData?.data ||
      isVideoProgressLoading ||
      isWorkoutProgressLoading
    )
      return;

    const workout = paginatedData.data.find(
      (w: WorkoutDetailsPro) => w.id === id! || w._id === id!
    );
    if (!workout?.exercises) {
      console.error("Workout or exercises not found for id:", id);
      setErrorMessage("Workout not found.");
      return;
    }

    let videoProgress: IWorkoutVideoProgressEntity | undefined;

    if (Array.isArray((videoProgressData as any)?.items)) {
      videoProgress = (videoProgressData as any).items.find(
        (item: IWorkoutVideoProgressEntity) => item.workoutId === id
      );
    } else {
      console.warn(
        "videoProgressData.items is not an array:",
        videoProgressData
      );
    }

    console.log("Video progress data:", videoProgress);

    let latestWorkoutProgress: IWorkoutProgressEntity | undefined;
    if (Array.isArray(workoutProgressData)) {
      latestWorkoutProgress = workoutProgressData.reduce(
        (
          latest: IWorkoutProgressEntity | undefined,
          current: IWorkoutProgressEntity
        ) => {
          if (
            !latest ||
            new Date(current.updatedAt) > new Date(latest.updatedAt)
          ) {
            return current;
          }
          return latest;
        },
        undefined
      );
    }
    console.log("Existing workout progress:", latestWorkoutProgress);

    // Skip update if local state is more recent
    if (
      workoutProgress.exerciseProgress.some(
        (ep) =>
          ep.lastUpdated &&
          new Date(ep.lastUpdated) >
            new Date(latestWorkoutProgress?.updatedAt || 0)
      )
    ) {
      console.log("Skipping useEffect update due to recent local changes");
      return;
    }

    setExistingWorkoutProgress(latestWorkoutProgress || null);

    const newWorkoutProgress: WorkoutProgressType = {
      _id: latestWorkoutProgress?._id,
      exerciseProgress:
        videoProgress?.exerciseProgress?.map((ep) => ({
          ...ep,
          status: ep.status as "Not Started" | "In Progress" | "Completed",
        })) || [],
      completedExercises: videoProgress?.completedExercises || [],
    };

    setWorkoutProgress(newWorkoutProgress);
    setProgressId(latestWorkoutProgress?._id || null);
    setWorkoutCompleted(latestWorkoutProgress?.completed || false);

    if (videoProgress && workout.exercises) {
      const completedExerciseIds = new Set(
        videoProgress.completedExercises || []
      );
      const nextExerciseIdx = workout.exercises.findIndex(
        (exercise: Exercise) =>
          !completedExerciseIds.has(exercise?.id || exercise?._id || "")
      );
      const newExerciseIdx =
        nextExerciseIdx !== -1 ? nextExerciseIdx : workout.exercises.length - 1;
      setCurrentExerciseIdx(newExerciseIdx);
      // Initialize video progress for the current exercise
      const currentExerciseProgress = videoProgress?.exerciseProgress?.find(
        (ep) => ep.exerciseId === (workout.exercises[newExerciseIdx]?.id || workout.exercises[newExerciseIdx]?._id)
      );
      setCurrentVideoProgress(currentExerciseProgress?.videoProgress || 0);
    }
  }, [
    paginatedData,
    videoProgressData,
    workoutProgressData,
    isVideoProgressLoading,
    isWorkoutProgressLoading,
    id,
  ]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const markExerciseAsCompleted = useCallback(
    (exerciseId: string) => {
      if (!isValidObjectId(exerciseId)) {
        console.error("Invalid exerciseId:", exerciseId);
        setErrorMessage("Invalid exercise ID.");
        return;
      }

      if (currentVideoProgress < 90) {
        setErrorMessage(
          `Please watch at least 90% of the video to mark this exercise as completed. Current progress: ${Math.round(
            currentVideoProgress
          )}%`
        );
        return;
      }

      if (!workoutProgress.completedExercises.includes(exerciseId)) {
        const workout = paginatedData?.data.find(
          (w: WorkoutDetailsPro) => w.id === id! || w._id === id!
        );
        if (!workout?.exercises) {
          console.error("Workout or exercises not found for id:", id);
          setErrorMessage("Workout not found.");
          return;
        }

        const currentExercise = workout.exercises.find(
          (e: Exercise) => (e.id || e._id) === exerciseId
        );
        if (!currentExercise?.duration) {
          console.error("Exercise missing duration:", exerciseId);
          setErrorMessage("Exercise duration is missing.");
          return;
        }

        // Optimistic update
        const newCompletedExercises = [
          ...workoutProgress.completedExercises,
          exerciseId,
        ];
        const newExerciseProgress = [
          ...workoutProgress.exerciseProgress.filter(
            (ep) => ep.exerciseId !== exerciseId
          ),
          {
            exerciseId,
            videoProgress: currentVideoProgress,
            status: "Completed" as const,
            lastUpdated: new Date(),
          },
        ];

        const updatedProgress: WorkoutProgressType = {
          _id: workoutProgress._id,
          exerciseProgress: newExerciseProgress,
          completedExercises: newCompletedExercises,
        };

        console.log("Applying optimistic update:", updatedProgress);
        setWorkoutProgress(updatedProgress);

        const isWorkoutComplete =
          newCompletedExercises.length === workout.exercises.length;
        const partialDuration = workout.exercises
          .filter((exercise: Exercise) =>
            newCompletedExercises.includes(exercise?.id || exercise?._id || "")
          )
          .reduce(
            (sum: number, exercise: Exercise) => sum + (exercise.duration || 0),
            0
          );

        const metValue = workout.category?.metValue || 5;
        const weight = client?.weight || 70;
        const intensityMap = {
          Beginner: 0.8,
          Intermediate: 1.0,
          Advanced: 1.2,
        };
        const intensity =
          intensityMap[workout.difficulty as keyof typeof intensityMap] || 1;
        const durationInHours = partialDuration / 3600;
        const caloriesBurned = Math.round(
          metValue * weight * durationInHours * intensity
        );

        if (!partialDuration || !caloriesBurned) {
          console.error("Invalid progress values:", {
            partialDuration,
            caloriesBurned,
          });
          setErrorMessage("Failed to calculate progress values.");
          return;
        }

        console.log("Exercise completed, updating progress:", {
          exerciseId,
          partialDuration,
          caloriesBurned,
          isWorkoutComplete,
        });

        updateVideoProgress(
          {
            workoutId: id!,
            videoProgress: currentVideoProgress,
            status: isWorkoutComplete ? "Completed" : "In Progress",
            completedExercises: newCompletedExercises,
            userId: userId!,
            exerciseId,
          },
          {
            onSuccess: () => {
              console.log(
                "Video progress updated successfully for exercise:",
                exerciseId
              );
              queryClient.invalidateQueries({
                queryKey: ["userWorkoutVideoProgress", userId],
              });

              if (isWorkoutComplete) {
                setShowCompletionModal(true);
              }
            },
            onError: (error: any) => {
              console.error("Error updating video progress:", error);
              setErrorMessage(
                error.message || "Failed to update video progress."
              );
              setWorkoutProgress(workoutProgress); // Revert optimistic update
            },
          }
        );

        if (progressId) {
          console.log("Updating workout progress:", {
            progressId,
            duration: partialDuration,
            caloriesBurned,
            isWorkoutComplete,
          });
          updateWorkoutProgress(
            {
              progressId,
              data: {
                duration: partialDuration,
                caloriesBurned,
                completed: isWorkoutComplete,
              },
            },
            {
              onSuccess: () => {
                console.log("Workout progress updated successfully");
                queryClient.invalidateQueries({
                  queryKey: ["userWorkoutProgress", userId],
                });
                setWorkoutCompleted(isWorkoutComplete);
                setExistingWorkoutProgress({
                  _id: progressId,
                  userId: userId!,
                  workoutId: id!,
                  duration: partialDuration,
                  caloriesBurned,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                if (isWorkoutComplete && socket) {
                  socket.emit("workoutCompleted", { userId, workoutId: id });
                }
                setErrorMessage(null);
              },
              onError: (error: any) => {
                console.error("Error updating workout progress:", error);
                setErrorMessage(
                  error.message || "Failed to update workout progress."
                );
                setWorkoutProgress(workoutProgress); // Revert optimistic update
              },
            }
          );
        } else {
          console.log("Creating workout progress:", {
            userId,
            workoutId: id,
            duration: partialDuration,
            caloriesBurned,
            isWorkoutComplete,
          });
          createWorkoutProgress(
            {
              userId: userId!,
              workoutId: id!,
              duration: partialDuration,
              caloriesBurned,
              completed: isWorkoutComplete,
              categoryId: workout.category?._id || "67fd2ee8c3806ffcf4a8386d",
            },
            {
              onSuccess: (data) => {
                setProgressId(data._id);
                setWorkoutProgress({ ...updatedProgress, _id: data._id });
                setExistingWorkoutProgress({
                  _id: data._id,
                  userId: userId!,
                  workoutId: id!,
                  duration: partialDuration,
                  caloriesBurned,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                queryClient.invalidateQueries({
                  queryKey: ["userWorkoutProgress", userId],
                });
                console.log(
                  "Workout progress created successfully, id:",
                  data._id
                );
                setWorkoutCompleted(isWorkoutComplete);
                if (isWorkoutComplete && socket) {
                  socket.emit("workoutCompleted", { userId, workoutId: id });
                }
                setErrorMessage(null);
              },
              onError: (error: any) => {
                console.error("Error creating workout progress:", error);
                setErrorMessage(
                  error.message || "Failed to update workout progress."
                );
                setWorkoutProgress(workoutProgress); // Revert optimistic update
              },
            }
          );
        }
      }
    },
    [
      workoutProgress,
      id,
      userId,
      updateVideoProgress,
      paginatedData,
      createWorkoutProgress,
      updateWorkoutProgress,
      progressId,
      socket,
      client?.weight,
      queryClient,
      currentVideoProgress,
    ]
  );

  if (!userId) {
    return (
      <div className="text-red-600 text-center">
        Please log in to view workout details.
      </div>
    );
  }

  if (!id) {
    return (
      <div className="text-red-600 text-center">Workout ID is missing.</div>
    );
  }

  if (
    isLoading ||
    isVideoProgressLoading ||
    isWorkoutProgressLoading ||
    isCreatingWorkoutProgress ||
    isUpdatingVideoProgress
  ) {
    return (
      <div className="text-center text-gray-600">
        Loading workout details...
      </div>
    );
  }

  if (isError || !paginatedData) {
    return (
      <div className="text-red-600 text-center">
        Error fetching workout details. Please try again later.
      </div>
    );
  }

  const workouts = paginatedData.data;
  const workout = workouts.find(
    (w: WorkoutDetailsPro) => w.id === id! || w._id === id!
  );

  if (!workout) {
    return <div className="text-red-600 text-center">Workout not found.</div>;
  }

  if (!workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="text-red-600 text-center">
        This workout has no exercises.
      </div>
    );
  }

  console.log("Workout data:", workout);

  const safeExerciseIndex = Math.min(
    Math.max(0, currentExerciseIdx),
    workout.exercises.length - 1
  );
  const currentExercise = workout.exercises[safeExerciseIndex];
  const currentExerciseId = currentExercise?.id || currentExercise?._id;

  if (!currentExerciseId || !isValidObjectId(currentExerciseId)) {
    console.error("Invalid exerciseId for current exercise:", currentExercise);
    return (
      <div className="text-red-600 text-center">
        Error: Current exercise is missing a valid ID.
      </div>
    );
  }

  const completionTime = workoutProgress.exerciseProgress?.length
    ? new Date(
        workoutProgress.exerciseProgress[
          workoutProgress.exerciseProgress.length - 1
        ].lastUpdated || Date.now()
      ).toISOString()
    : new Date().toISOString();

  const modalProps = {
    isOpen: showCompletionModal,
    onClose: () => {
      setShowCompletionModal(false);
      navigate("/");
    },
    userName:
      `${client?.firstName ?? ""} ${client?.lastName ?? ""}`.trim() || "User",
    workoutTitle: workout.title,
    workoutCategory: workout.category?.title || "Workout",
    difficulty: workout.difficulty,
    exercisesCompleted: workoutProgress.completedExercises.length,
    totalExercises: workout.exercises.length,
    totalDuration: formatDuration(existingWorkoutProgress?.duration || 0),
    caloriesBurned: existingWorkoutProgress?.caloriesBurned || 0,
    exercises: workout.exercises.map((exercise: Exercise) => ({
      name: exercise.name,
      duration: formatDuration(exercise.duration || 0),
    })),
    completedAt: completionTime,
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Workouts
          </Link>
        </motion.div>

        {errorMessage && (
          <motion.div
            className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl shadow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Error: {errorMessage}
          </motion.div>
        )}

        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {workout.title}
            </h1>
            {workout.isPremium && (
              <span className="inline-block bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4 max-w-2xl">{workout.description}</p>

          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>{workout.duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span>{workout.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-indigo-600" />
              <span>{workout.exercises.length} exercises</span>
            </div>
          </div>
        </motion.header>

        {workoutCompleted && !showCompletionModal && (
          <motion.div
            className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg shadow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Workout completed! Progress saved.
          </motion.div>
        )}

        <WorkoutCompletionModal {...modalProps} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            className="lg:col-span-3 order-2 lg:order-1"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MusicPlayer
              className="mb-6"
              category={workout.category?.title || "All"}
            />
            <ProgressTracker
              totalExercises={workout.exercises.length}
              completedExercises={workoutProgress.completedExercises.length}
              currentExerciseIndex={safeExerciseIndex}
              exerciseProgress={workoutProgress.exerciseProgress}
              workout={workout}
            />
          </motion.div>

          <motion.div
            className="lg:col-span-9 order-1 lg:order-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VideoPlayer
              videoUrl={currentExercise.videoUrl || ""}
              exerciseName={currentExercise.name}
              exerciseDescription={currentExercise.description}
              workoutId={workout.id || workout._id || id}
              completedExercises={workoutProgress.completedExercises}
              onComplete={() => markExerciseAsCompleted(currentExerciseId)}
              onNext={() => {
                if (safeExerciseIndex < workout.exercises.length - 1) {
                  setCurrentExerciseIdx(safeExerciseIndex + 1);
                  setCurrentVideoProgress(0);
                }
              }}
              workout={workout}
              userId={userId}
              exerciseId={currentExerciseId}
              onProgressUpdate={setCurrentVideoProgress}
              initialProgress={currentVideoProgress}
            />

            <div className="mt-6 flex justify-between items-center">
              <button
                className={`px-6 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 ${
                  safeExerciseIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (safeExerciseIndex > 0) {
                    setCurrentExerciseIdx(safeExerciseIndex - 1);
                    const prevExerciseId = workout.exercises[safeExerciseIndex - 1]?.id || workout.exercises[safeExerciseIndex - 1]?._id;
                    const prevProgress = workoutProgress.exerciseProgress.find(
                      (ep) => ep.exerciseId === prevExerciseId
                    );
                    setCurrentVideoProgress(prevProgress?.videoProgress || 0);
                  }
                }}
                disabled={safeExerciseIndex === 0}
              >
                Previous
              </button>

              <div className="flex items-center gap-4">
                <div className="text-gray-600">
                  Video Progress: {Math.round(currentVideoProgress)}%
                </div>
                <button
                  className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center ${
                    currentVideoProgress < 90 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (currentVideoProgress >= 90) {
                      markExerciseAsCompleted(currentExerciseId);
                      if (safeExerciseIndex < workout.exercises.length - 1) {
                        setCurrentExerciseIdx(safeExerciseIndex + 1);
                        const nextExerciseId = workout.exercises[safeExerciseIndex + 1]?.id || workout.exercises[safeExerciseIndex + 1]?._id;
                        const nextProgress = workoutProgress.exerciseProgress.find(
                          (ep) => ep.exerciseId === nextExerciseId
                        );
                        setCurrentVideoProgress(nextProgress?.videoProgress || 0);
                      }
                    }
                  }}
                  disabled={currentVideoProgress < 90}
                >
                  {safeExerciseIndex < workout.exercises.length - 1
                    ? "Next Exercise"
                    : "Finish Workout"}
                  <Play className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Exercises
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workout.exercises.map(
                    (exercise: Exercise, index: number) => {
                      const exerciseId = exercise.id || exercise._id;
                      console.log("Exercise ID:", {
                        index,
                        exerciseId,
                        exercise,
                      });
                      if (!exerciseId || !isValidObjectId(exerciseId)) {
                        console.error(
                          "Invalid exerciseId for exercise:",
                          exercise
                        );
                        return null;
                      }
                      return (
                        <ExerciseItem
                          key={exerciseId}
                          id={exerciseId}
                          name={exercise.name}
                          description={exercise.description}
                          duration={exercise.duration}
                          videoUrl={exercise.videoUrl}
                          isActive={safeExerciseIndex === index}
                          isCompleted={workoutProgress.completedExercises.includes(
                            exerciseId
                          )}
                          onClick={() => {
                            setCurrentExerciseIdx(index);
                            const exerciseProgress = workoutProgress.exerciseProgress.find(
                              (ep) => ep.exerciseId === exerciseId
                            );
                            setCurrentVideoProgress(exerciseProgress?.videoProgress || 0);
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default WorkoutDetails;