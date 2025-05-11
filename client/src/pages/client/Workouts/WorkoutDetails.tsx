"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, BarChart3, Play, Dumbbell } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux"; // Add useDispatch
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import ExerciseItem from "./ExerciseItem";
import VideoPlayer from "./VideoPlayer";
import MusicPlayer from "./MusicPlayer";
import ProgressTracker from "./ProgressTracker";
import { motion } from "framer-motion";
import { useAllWorkouts } from "@/hooks/client/useAllWorkouts";
import { useGetUserWorkoutVideoProgress } from "@/hooks/progress/useGetUserWorkoutVideoProgress";
import { useUpdateWorkoutVideoProgress } from "@/hooks/progress/useUpdateWorkoutVideoProgress";
import { RootState } from "@/store/store";
import { Workout } from "@/types/Workouts";
import { setWorkoutProgress, updateExerciseProgress, addCompletedExercise } from "@/store/slices/workoutProgress.slice"; 

const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const dispatch = useDispatch(); // Add dispatch
  const client = useSelector((state: RootState) => state.client.client);
  const userId = client?.id;
  // Retrieve workout progress from Redux
  const workoutProgress = useSelector((state: RootState) => state.workoutProgress[id || ""] || {
    exerciseProgress: [],
    completedExercises: [],
  });

  const { data: paginatedData, isLoading, isError } = useAllWorkouts(1, 10, {});
  const { data: videoProgressData, isLoading: isVideoProgressLoading } = useGetUserWorkoutVideoProgress(userId || "");
  const { mutate: updateVideoProgress } = useUpdateWorkoutVideoProgress();

  useEffect(() => {
    if (!userId || !id) return;

    const socketInstance = io("http://localhost:5001");
    socketInstance.emit("register", { userId, role: "client" });
    socketInstance.on("workoutCompleted", (data) => {
      if (data.userId === userId && data.workoutId === id) {
        setWorkoutCompleted(true);
      }
    });
    setSocket(socketInstance);

    // Sync with backend video progress data
    if (videoProgressData) {
      if (Array.isArray(videoProgressData)) {
        const videoProgress = videoProgressData.find((item) => item.workoutId === id);
        if (videoProgress) {
          // Update Redux store with backend data
          dispatch(
            setWorkoutProgress({
              workoutId: id,
              exerciseProgress: videoProgress.exerciseProgress || [],
              completedExercises: videoProgress.completedExercises || [],
            })
          );
          setWorkoutCompleted(
            videoProgress.exerciseProgress?.every((ep: any) => ep.status === "Completed") || false
          );
        }
      } else if (typeof videoProgressData === "object" && videoProgressData !== null) {
        if (videoProgressData.workoutId === id) {
          dispatch(
            setWorkoutProgress({
              workoutId: id,
              exerciseProgress: videoProgressData.exerciseProgress || [],
              completedExercises: videoProgressData.completedExercises || [],
            })
          );
          setWorkoutCompleted(
            videoProgressData.exerciseProgress?.every((ep: any) => ep.status === "Completed") || false
          );
        }
      } else {
        console.log("Video progress data is in an unexpected format:", videoProgressData);
      }
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, id, videoProgressData, dispatch]);

  if (!userId) {
    return <div>Please log in to view workout details.</div>;
  }

  if (isLoading || isVideoProgressLoading) {
    return <div>Loading workout details...</div>;
  }

  if (isError || !paginatedData) {
    return <div>Error fetching workout details. Please try again later.</div>;
  }

  const workouts = paginatedData.data;
  const workout = workouts.find((w: Workout) => w.id === id);

  if (!workout) {
    return <div>Workout not found.</div>;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  const markExerciseAsCompleted = (exerciseId: string) => {
    if (!workoutProgress.completedExercises.includes(exerciseId)) {
      const newCompletedExercises = [...workoutProgress.completedExercises, exerciseId];
      const newExerciseProgress = [
        ...workoutProgress.exerciseProgress.filter((ep) => ep.exerciseId !== exerciseId),
        { exerciseId, videoProgress: 100, status: "Completed" },
      ];

      // Update Redux store
      dispatch(
        setWorkoutProgress({
          workoutId: id!,
          exerciseProgress: newExerciseProgress,
          completedExercises: newCompletedExercises,
        })
      );
      dispatch(addCompletedExercise({ workoutId: id!, exerciseId }));

      // Ensure status is always explicitly set
      const status = newCompletedExercises.length === workout.exercises.length ? "Completed" : "In Progress";

      // Sync with backend
      updateVideoProgress(
        {
          workoutId: workout.id,
          videoProgress: 100,
          status,
          completedExercises: newCompletedExercises,
          userId,
          exerciseId,
        },
        {
          onError: (error) => {
            console.error("Failed to update video progress:", error);
          },
          onSuccess: () => {
            if (status === "Completed" && socket) {
              socket.emit("workoutCompleted", { userId, workoutId: workout.id });
            }
          },
        }
      );
    }
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-6 mt-16">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/workouts"
            className="inline-flex items-center text-violet-600 hover:text-violet-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Workouts</span>
          </Link>
        </motion.div>

        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-violet-800">{workout.title}</h1>
            {workout.isPremium && (
              <span className="bg-violet-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4 max-w-2xl">{workout.description}</p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1 text-violet-700">
              <Clock size={16} />
              <span>{workout.duration} min</span>
            </div>
            <div className="flex items-center gap-1 text-violet-700">
              <BarChart3 size={16} />
              <span>{workout.difficulty}</span>
            </div>
            <div className="flex items-center gap-1 text-violet-700">
              <Dumbbell size={16} />
              <span>{workout.exercises.length} exercises</span>
            </div>
          </div>
        </motion.header>

        {workoutCompleted && (
          <motion.div
            className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Workout completed! Progress saved.
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            className="lg:col-span-3 order-3 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MusicPlayer category={workout.category} />
            <div className="mt-6">
              <ProgressTracker
                totalExercises={workout.exercises.length}
                completedExercises={workoutProgress.completedExercises.length}
                currentExerciseIndex={currentExerciseIndex}
                exerciseProgress={workoutProgress.exerciseProgress}
              />
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-9 order-1 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VideoPlayer
              videoUrl={currentExercise.videoUrl}
              exerciseName={currentExercise.name}
              exerciseDescription={currentExercise.description}
              workoutId={workout.id}
              exerciseId={currentExercise.id || `${currentExerciseIndex}`}
              completedExercises={workoutProgress.completedExercises}
              onComplete={markExerciseAsCompleted}
            />

            <div className="mt-6 flex justify-between">
              <button
                className={`px-6 py-3 rounded-xl bg-white shadow-md text-violet-600 hover:bg-violet-50 transition-colors ${
                  currentExerciseIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (currentExerciseIndex > 0) {
                    setCurrentExerciseIndex(currentExerciseIndex - 1);
                  }
                }}
                disabled={currentExerciseIndex === 0}
              >
                Previous
              </button>

              <button
                className="px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md flex items-center"
                onClick={() => {
                  markExerciseAsCompleted(currentExercise.id || `${currentExerciseIndex}`);
                  if (currentExerciseIndex < workout.exercises.length - 1) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                  }
                }}
              >
                {currentExerciseIndex < workout.exercises.length - 1 ? (
                  <>Next Exercise</>
                ) : (
                  <>Finish Workout</>
                )}
                <Play className="ml-2 h-4 w-4" />
              </button>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-violet-800 mb-4">Exercises</h2>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {workout.exercises.map((exercise: Workout["exercises"][number], index: number) => (
                    <ExerciseItem
                      key={exercise.id || index}
                      id={exercise.id || `${index}`}
                      name={exercise.name}
                      description={exercise.description}
                      duration={exercise.duration}
                      videoUrl={exercise.videoUrl}
                      isActive={currentExerciseIndex === index}
                      isCompleted={workoutProgress.completedExercises.includes(exercise.id || `${index}`)}
                      onClick={() => setCurrentExerciseIndex(index)}
                    />
                  ))}
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