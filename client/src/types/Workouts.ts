export interface Exercise {
  name: string;
  description: string;
  duration: number; // In minutes
  defaultRestDuration: number; // In seconds
}

export interface Workout {
  _id?: string;
  title: string;
  description: string;
  category: string;
  duration: number; // In minutes
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
  name: string;
}
