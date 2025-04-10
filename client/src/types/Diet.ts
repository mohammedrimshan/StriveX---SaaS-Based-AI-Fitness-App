// src/types/planTypes.ts
export interface IMeal {
  name: string;
  time: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
}

export interface IDietDay {
  day: string;
  meals: IMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  waterIntake: number;
}

export interface IDietPlan {
  id: string;
  clientId: string;
  title: string;
  description: string;
  weeklyPlan: IDietDay[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
