export interface IGetAllSelectedClientsUseCase {
  execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{
    clients: Array<{
      id: string;
      clientId: string;
      firstName: string;
      lastName: string;
      email: string;
      fitnessGoal?: string;
      experienceLevel?: string;
      preferredWorkout?: string;
      selectStatus: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
  }>;
}