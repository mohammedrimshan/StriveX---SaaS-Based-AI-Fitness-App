import { IReviewEntity } from "@/entities/models/review.entity";

export interface ICreateReviewUseCase {
  execute(
    clientId: string,
    trainerId: string,
    rating: number,
    comment?: string
  ): Promise<IReviewEntity>;
}