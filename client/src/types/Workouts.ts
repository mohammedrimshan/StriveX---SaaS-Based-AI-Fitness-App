
export interface Exercise {
  _id?: string; 
  id?: string; 
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl: string;
}

export interface Workout {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  exercises: Exercise[];
  isPremium: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  _id: string;
  title: string;
  description: string;
  status: boolean;
}