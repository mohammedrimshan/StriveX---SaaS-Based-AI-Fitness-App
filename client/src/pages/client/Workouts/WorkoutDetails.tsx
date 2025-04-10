"use client";

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, BarChart3, Play, Dumbbell } from "lucide-react";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import ExerciseItem from "./ExerciseItem";
import VideoPlayer from "./VideoPlayer";
import MusicPlayer from "./MusicPlayer";
import ProgressTracker from "./ProgressTracker";
import { motion } from "framer-motion";
import { useAllWorkouts } from "@/hooks/client/useAllWorkouts";
import { Workout } from "@/types/Workouts";

const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Fetch workout details using useAllWorkouts
  const { data: paginatedData, isLoading, isError } = useAllWorkouts(1, 10, {});

  if (isLoading) {
    return <div>Loading workout details...</div>;
  }

  if (isError || !paginatedData) {
    return <div>Error fetching workout details. Please try again later.</div>;
  }

  // Extract the workout from the paginated response
  const workouts = paginatedData.data; // Explicitly type this as Workout[]
  const workout = workouts.find((w: Workout) => w.id === id);

  if (!workout) {
    return <div>Workout not found.</div>;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  const markExerciseAsCompleted = (exerciseId: string) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-6 mt-16">
        {/* Back button */}
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

        {/* Workout header */}
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

        {/* New layout structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Music player (Left) */}
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
                completedExercises={completedExercises.length}
                currentExerciseIndex={currentExerciseIndex}
              />
            </div>
          </motion.div>

          {/* Main content - Video player (Center) */}
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

            {/* Exercise list */}
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
                      isCompleted={completedExercises.includes(exercise.id || `${index}`)}
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