import { IExerciseEntity } from "@/entities/models/workout.entity";
import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IAddExerciseUseCase {
    execute(workoutId: string, exerciseData: IExerciseEntity,files?: {  video?: string }): Promise<IWorkoutEntity>;
}