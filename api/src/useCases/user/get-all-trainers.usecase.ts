// api\src\useCases\user\get-all-trainers.usecase.ts
import { inject, injectable } from "tsyringe";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { IGetAllTrainersUseCase } from "@/entities/useCaseInterfaces/users/get-all-trainers.usecase.interface";

@injectable()
export class GetAllTrainersUseCase implements IGetAllTrainersUseCase {
  constructor(
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<{ trainers: ITrainerEntity[]; total: number }> {
    let filter: any = {
      role: "trainer",
      status: "active", 
      approvalStatus: "approved" 
    };

    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const validPageNumber = Math.max(1, pageNumber);
    const validPageSize = Math.max(1, pageSize);
    const skip = (validPageNumber - 1) * validPageSize;
    const limit = validPageSize;
    const { items:trainers, total } = await this._trainerRepository.find(filter, skip, limit);

    return {
      trainers,
      total: Math.ceil(total / validPageSize),
    };
  }
}