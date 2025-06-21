"use client";

import { Link } from "react-router-dom";
import { Clock, Dumbbell, BarChart } from "lucide-react";

interface WorkoutCardProps {
  id?: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  isPremium?: boolean;
  isUserPremium?: boolean;
  onPremiumAccessAttempt?: () => void; 
  isInRouterContext?: boolean;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  title,
  description,
  duration,
  difficulty,
  imageUrl,
  isPremium = false,
  isUserPremium = false,
  onPremiumAccessAttempt,
  isInRouterContext = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isPremium && !isUserPremium) {
      e.preventDefault(); // Prevent navigation
      onPremiumAccessAttempt?.(); // Trigger modal
    }
  };

  const CardContent = () => (
    <div
      className="workout-card h-[300px] animate-fade-in"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "0.75rem",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        height: "300px",
        animation: "fade-in 0.5s ease-out",
      }}
    >
      <div className="absolute inset-0 z-0">
        <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-5">
        {isPremium && (
          <div className="absolute top-4 right-4 bg-fitness-orange text-white px-2 py-1 rounded-md text-xs font-semibold">
            PREMIUM
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-white truncate">{title}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{description}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-1 text-white/70 text-xs">
              <Clock size={14} />
              <span>{duration} min</span>
            </div>

            <div className="flex items-center gap-1 text-white/70 text-xs">
              <BarChart size={14} />
              <span>{difficulty}</span>
            </div>

            <div className="flex items-center gap-1 text-white/70 text-xs">
              <Dumbbell size={14} />
              <span>Workout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isInRouterContext && id ? (
    <Link to={`/workout/${id}`} className="block no-underline" onClick={handleClick}>
      <CardContent />
    </Link>
  ) : (
    <div className="block no-underline" onClick={handleClick}>
      <CardContent />
    </div>
  );
};

export default WorkoutCard;