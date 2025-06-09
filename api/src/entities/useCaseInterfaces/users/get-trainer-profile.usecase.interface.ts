
import { TrainerProfileViewDto } from "@/shared/dto/rainer-profile-view.dto";

export interface IGetTrainerProfileUseCase{
    execute(trainerId: string, clientId?: string): Promise<TrainerProfileViewDto>;
}