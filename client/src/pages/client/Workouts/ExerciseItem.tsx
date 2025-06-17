"use client"

import React from "react";
import { Clock, PlayCircle, Video } from "lucide-react";

interface ExerciseItemProps {
  id: string;
  name: string;
  description: string;
  duration: number;
  videoUrl?: string | string[]; 
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

// ExerciseItem.tsx
const ExerciseItem: React.FC<ExerciseItemProps> = React.memo(({
  name,
  description,
  duration,
  videoUrl,
  isActive,
  isCompleted,
  onClick,
}) => {
  const hasVideo = Array.isArray(videoUrl) ? videoUrl.length > 0 : !!videoUrl;

  return (
    <div
      className={`exercise-item ${isActive ? "active-exercise" : ""} ${isCompleted ? "border-green-400" : ""}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        margin: "0.5rem 0",
        borderRadius: "0.75rem",
        backgroundColor: isActive ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.05)",
        borderWidth: "1px",
        borderColor: isActive ? "var(--violet)" : isCompleted ? "#4ade80" : "rgba(139, 92, 246, 0.1)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div className="relative mr-4">
        {isCompleted ? (
          <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-fitness-purple/20 flex items-center justify-center">
            {hasVideo ? (
              <Video className="h-5 w-5 text-fitness-purple" />
            ) : (
              <PlayCircle className="h-5 w-5 text-fitness-purple" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{description}</p>
      </div>

      <div className="flex items-center text-gray-400 space-x-1">
        <Clock size={14} />
        <span className="text-sm">{duration} sec</span>
      </div>
    </div>
  );
});

export default ExerciseItem;