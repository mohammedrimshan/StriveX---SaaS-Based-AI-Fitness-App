import { injectable, inject } from "tsyringe";
import { IGetTrainerReviewsUseCase } from "@/entities/useCaseInterfaces/review/get-trainer-reviews-usecase.interface";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { IReviewEntity } from "@/entities/models/review.entity";

@injectable()
export class GetTrainerReviewsUseCase implements IGetTrainerReviewsUseCase {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository
  ) {}

  async execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IReviewEntity[] | []; total: number }> {
    return this.reviewRepository.findReviewsByTrainerId(trainerId, skip, limit);
  }
}