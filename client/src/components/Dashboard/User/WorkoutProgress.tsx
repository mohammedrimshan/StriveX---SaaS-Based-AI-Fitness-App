import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';

interface WorkoutProgressProps {
  workouts: any[];
  workoutProgress: any[];
  videoProgress: any[];
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({ workouts, workoutProgress, videoProgress }) => {
  const getExerciseProgress = (workoutId: string, exerciseId: string) => {
    const progress = videoProgress.find(vp => vp.workoutId === workoutId);
    if (!progress) return { completed: false, progress: 0 };
    
    const exercise = progress.exerciseProgress.find((ep: any) => ep.exerciseId === exerciseId);
    return {
      completed: exercise?.status === 'Completed',
      progress: exercise?.videoProgress || 0
    };
  };

  const getWorkoutData = (workoutId: string) => {
    return workoutProgress.find(wp => wp.workoutId === workoutId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Workout Progress</h3>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {workouts.map((workout) => {
          const workoutData = getWorkoutData(workout.id);
          
          return (
            <motion.div
              key={workout.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {workout.title}
                </h4>
                {workoutData && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} className="text-blue-500" />
                      <span>{Math.round(workoutData.duration / 60)}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame size={14} className="text-orange-500" />
                      <span>{workoutData.caloriesBurned}cal</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {workout.exercises.slice(0, 3).map((exercise: any, index: number) => {
                  const { completed, progress } = getExerciseProgress(workout.id, exercise._id);
                  
                  return (
                    <motion.div
                      key={exercise._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-2 bg-white rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{exercise.name}</p>
                          <p className="text-xs text-gray-500">{exercise.duration}s</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-600">{progress}%</p>
                        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                          <motion.div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {workout.exercises.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{workout.exercises.length - 3} more exercises
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default WorkoutProgress;
