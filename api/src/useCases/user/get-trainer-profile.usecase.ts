import { inject,injectable } from "tsyringe";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IGetTrainerProfileUseCase } from "@/entities/useCaseInterfaces/users/get-trainer-profile.usecase.interface";
import { ITrainerEntity } from "@/entities/models/trainer.entity";


@injectable()
export class GetTrainerProfileUseCase implements IGetTrainerProfileUseCase{
    constructor(
        @inject("ITrainerRepository")
        private trainerRepository:ITrainerRepository
    ){}

    async execute(trainerId: string): Promise<ITrainerEntity | null> {
        return await this.trainerRepository.findById(trainerId)
    }
}
