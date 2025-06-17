import { TrainerProfile } from "@/types/trainer";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { UserIcon, Loader2 } from "lucide-react";

interface TrainerCardProps {
  trainer: TrainerProfile;
  onSelect: (trainer: TrainerProfile) => void;
  onViewProfile: (trainerId: string) => void;
  isSelecting?: boolean;
}

const TrainerCard = ({ trainer, onSelect, onViewProfile, isSelecting }: TrainerCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-sm">
      <div className="p-4 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-purple-200 flex items-center justify-center bg-purple-50">
          {trainer.profileImage ? (
            <img
              src={trainer.profileImage}
              alt={`${trainer.firstName} ${trainer.lastName}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <UserIcon className="w-12 h-12 text-purple-300" />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-1 text-center">
          {trainer.firstName} {trainer.lastName}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 text-center">
          {trainer.experience} years experience • {trainer.gender}
        </p>
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {trainer.skills?.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
          {trainer.skills && trainer.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              +{trainer.skills.length - 3} more
            </span>
          )}
        </div>
      </div>
      <CardFooter className="px-4 pb-4 pt-0 flex gap-2">
        <Button
          onClick={() => onViewProfile(trainer.id)}
          className="flex-1 bg-white border border-purple-500 text-purple-600 hover:bg-purple-50"
          variant="outline"
          disabled={isSelecting} 
        >
          View Profile
        </Button>
        <Button
          onClick={() => onSelect(trainer)}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={isSelecting}
        >
          {isSelecting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrainerCard;