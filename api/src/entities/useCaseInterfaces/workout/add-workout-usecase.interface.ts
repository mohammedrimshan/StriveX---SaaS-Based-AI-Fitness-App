// api\src\entities\useCaseInterfaces\workout\add-workout-usecase.interface.ts
import { IWorkoutEntity } from "@/entities/models/workout.entity";

export interface IAddWorkoutUseCase {
  execute(workoutData: IWorkoutEntity, files: { image?: string,video?:string }): Promise<IWorkoutEntity>;
}