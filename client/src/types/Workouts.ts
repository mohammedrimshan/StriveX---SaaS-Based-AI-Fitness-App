export interface Exercise {
  id:string;
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl?: string; // Add this
}

export interface Workout {

  id?: string;
  title: string;
  description: string;
  category: string; 
  duration: number; 
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string; 
  exercises: {
    id:string;
    name: string;
    description: string;
    duration: number; 
    defaultRestDuration: number; 
    videoUrl?:string[];
  }[];
  isPremium: boolean; 
  status: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Category {
  _id: string;
  name: string;
}