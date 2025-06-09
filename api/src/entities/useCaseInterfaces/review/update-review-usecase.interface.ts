import { IReviewEntity } from "@/entities/models/review.entity";

export interface IUpdateReviewUseCase {
  execute(
    reviewId: string,
    clientId: string,
    rating: number,
    comment?: string
  ): Promise<IReviewEntity>;
}