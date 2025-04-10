import { ITrainerEntity } from "@/entities/models/trainer.entity";

export interface IGetTrainerProfileUseCase{
    execute(trainerId:string):Promise<ITrainerEntity | null>
}