import { IReviewEntity } from "@/entities/models/review.entity";
import { IBaseRepository } from "../base-repository.interface";

export interface IReviewRepository extends IBaseRepository<IReviewEntity> {
  createReview(review: Partial<IReviewEntity>): Promise<IReviewEntity>;
  updateReview(id: string, updates: Partial<IReviewEntity>): Promise<IReviewEntity | null>;
  findReviewsByTrainerId(trainerId: string, skip: number, limit: number): Promise<{ items: IReviewEntity[] | []; total: number }>;
  findReviewByClientAndTrainer(clientId: string, trainerId: string): Promise<IReviewEntity | null>;
  findLatestReviewsByTrainerId(
    trainerId: string,
    limit: number
  ): Promise<IReviewEntity[]>
}