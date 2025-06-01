import { inject, injectable } from "tsyringe";
import { IGetTrainerClientsUseCase } from "@/entities/useCaseInterfaces/trainer/get-clients-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, TrainerSelectionStatus } from "@/shared/constants";
import { IClientModel } from "@/frameworks/database/mongoDB/models/client.model";
@injectable()
export class GetTrainerClientsUseCase implements IGetTrainerClientsUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository
  ) {}

  async execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{
    user: Array<{
      id: string;
      clientId: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      profileImage?: string;
      fitnessGoal?: string;
      experienceLevel?: string;
      preferredWorkout?: string;
      selectStatus: string;
      createdAt: Date;
      updatedAt: Date;
      height?: number;
      weight?: number;
      status?: string;
      googleId?: string;
      activityLevel?: string;
      healthConditions?: string[];
      waterIntake?: number;
      dietPreference?: string;
      isPremium?: boolean;
      sleepFrom?: string;
      wakeUpAt?: string;
      skillsToGain: string[];
      selectionMode?: string;
      matchedTrainers?: string[];
      
    }>;
    total: number;
  }> {
    if (!trainerId) {
      throw new CustomError("Trainer ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const { items: clients, total } = await this._clientRepository.findAcceptedClients(
      trainerId,
      skip,
      limit
    );

    const formattedClients = clients.map((client) => ({
      id: client.id!,
      clientId: client.clientId,
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      email: client.email,
      phoneNumber: client.phoneNumber,
      profileImage: client.profileImage,
      fitnessGoal: client.fitnessGoal,
      experienceLevel: client.experienceLevel,
      preferredWorkout: client.preferredWorkout,
      selectStatus: client.selectStatus,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      height: client.height,
      weight: client.weight,
      status: client.status,
      googleId: client.googleId,
      activityLevel: client.activityLevel,
      healthConditions: client.healthConditions,
      waterIntake: client.waterIntake,
      dietPreference: client.dietPreference,
      isPremium: client.isPremium,
      sleepFrom: client.sleepFrom,
      wakeUpAt: client.wakeUpAt,
      skillsToGain: client.skillsToGain,
      selectionMode: client.selectionMode,
      matchedTrainers: client.matchedTrainers,
      
    }));

    return {
      user: formattedClients,
      total,
    };
  }
}