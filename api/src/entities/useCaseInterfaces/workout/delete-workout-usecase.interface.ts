export interface IDeleteWorkoutUseCase {
  execute(id: string): Promise<boolean>;
}