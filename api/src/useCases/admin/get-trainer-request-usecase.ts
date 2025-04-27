import { inject, injectable } from "tsyringe";
import { IGetTrainerRequestsUseCase } from "@/entities/useCaseInterfaces/admin/get-user-trainer-request-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";
import { PaginatedUsers } from "@/entities/models/paginated-users.entity";
import { TrainerRequestUser } from "@/entities/models/trainer.request.interface";
@injectable()
export class GetTrainerRequestsUseCase implements IGetTrainerRequestsUseCase {
    constructor(
        @inject("IClientRepository") private _clientRepository: IClientRepository,
        @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
    ) {}

async execute(pageNumber: number, pageSize: number ,searchTerm: string): Promise<PaginatedUsers<TrainerRequestUser>> {

    if(pageNumber<1||pageSize<1){
        throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }
   
    const filter = searchTerm 
    ?{
        $or: [
            {
                clientId:{
                    $regex: searchTerm,
                    $options: "i"
                }
            }
        ]
    }:{};


    const {items:preferences,total} = await this._clientRepository.find(filter,(pageNumber-1)*pageSize,pageSize);

    const userData = await Promise.all(
        preferences.map(async pref => {
          const client = await this._clientRepository.findByClientId(pref.clientId);
          const matchedTrainers = await Promise.all(
            (pref.matchedTrainers || []).map(async trainerId => {
              const trainer = await this._trainerRepository.findById(trainerId);
              return trainer ? { id: trainer.id, name: `${trainer.firstName} ${trainer.lastName}` } : null;
            })
          ).then(results => results.filter(t => t !== null));
  
          const selectedTrainer = pref.selectedTrainerId
            ? await this._trainerRepository.findById(pref.selectedTrainerId)
            : null;
  
          return {
            id: pref.id,
            client: client ? `${client.firstName} ${client.lastName}` : "Unknown",
            preferences: {
              workoutType: pref.preferredWorkout,
              fitnessGoal: pref.fitnessGoal,
              skillLevel: pref.experienceLevel,
              skillsToGain: pref.skillsToGain,
            },
            matchedTrainers,
            selectedTrainer: selectedTrainer ? { id: selectedTrainer.id, name: `${selectedTrainer.firstName} ${selectedTrainer.lastName}` } : null,
            status: pref.status,
          };
        })
      );
  
      return {
        user: userData,
        total: Math.ceil(total / pageSize),
      } as PaginatedUsers<TrainerRequestUser>;
    }
}