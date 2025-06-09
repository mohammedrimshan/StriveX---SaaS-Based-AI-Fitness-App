import { IReviewEntity } from "@/entities/models/review.entity";

export interface IGetTrainerReviewsUseCase {
  execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IReviewEntity[] | []; total: number }>;
}