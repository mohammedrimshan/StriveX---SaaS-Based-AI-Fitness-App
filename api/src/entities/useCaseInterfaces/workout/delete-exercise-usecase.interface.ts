import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IDeleteExerciseUseCase {
    execute(workoutId: string, exerciseId: string): Promise<IWorkoutEntity>;
}

