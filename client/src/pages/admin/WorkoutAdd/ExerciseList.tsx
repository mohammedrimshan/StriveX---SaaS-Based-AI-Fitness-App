import React from "react";
import { Hourglass, ListTodo, Pencil, TimerIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Exercise } from "@/types/Workouts";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onEdit, onRemove }) => {
  return (
    <motion.div
      className="mt-6"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
    >
      <motion.h3
        className="text-lg font-semibold mb-4 flex items-center"
        variants={itemVariants}
      >
        <ListTodo className="mr-2 h-5 w-5 text-purple-600" />
        Exercise List ({exercises.length})
      </motion.h3>
      <motion.div className="space-y-3" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        {exercises.map((exercise, index) => (
          <motion.div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col md:flex-row justify-between border-l-4 border-purple-500"
            variants={itemVariants}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className="flex-grow">
              <div className="flex justify-between">
                <h4 className="font-medium text-purple-700">{exercise.name}</h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TimerIcon className="h-3.5 w-3.5 mr-1 text-purple-500" />
                  <span>{exercise.duration} min</span>
                  <span className="mx-2">|</span>
                  <Hourglass className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                  <span>{exercise.defaultRestDuration}s</span>
                </div>
              </div>
              <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                {exercise.description}
              </p>
              {exercise.videoUrl && (
                <video
                  src={exercise.videoUrl}
                  controls
                  className="mt-2 w-full rounded-lg"
                  style={{ maxHeight: "150px" }}
                />
              )}
            </div>
            <div className="flex space-x-2 mt-3 md:mt-0 md:ml-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(index)}
                className="h-8 w-8 bg-white/80 hover:bg-purple-50 hover:text-purple-700 border-purple-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemove(index)}
                className="h-8 w-8 bg-white/80 hover:bg-red-50 hover:text-red-700 border-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ExerciseList;