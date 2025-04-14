import { IExerciseEntity } from "@/entities/models/workout.entity";
import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IUpdateExerciseUseCase {
    execute(workoutId: string, exerciseId: string, exerciseData: Partial<IExerciseEntity>,file?: { video?: string }): Promise<IWorkoutEntity>;
}