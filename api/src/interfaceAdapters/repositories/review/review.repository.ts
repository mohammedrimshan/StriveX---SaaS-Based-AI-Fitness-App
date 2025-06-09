import { injectable } from "tsyringe";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { IReviewEntity } from "@/entities/models/review.entity";
import { ReviewModel } from "@/frameworks/database/mongoDB/models/review.model";
import { BaseRepository } from "../base.repository";

@injectable()
export class ReviewRepository extends BaseRepository<IReviewEntity> implements IReviewRepository {
  constructor() {
    super(ReviewModel);
  }

  async createReview(review: Partial<IReviewEntity>): Promise<IReviewEntity> {
    return this.save(review);
  }

  async updateReview(id: string, updates: Partial<IReviewEntity>): Promise<IReviewEntity | null> {
    return this.update(id, updates);
  }

  async findReviewsByTrainerId(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IReviewEntity[] | []; total: number }> {
    return this.find({ trainerId }, skip, limit);
  }

   async findLatestReviewsByTrainerId(
    trainerId: string,
    limit: number = 3
  ): Promise<IReviewEntity[]> {
    const items = await this.model
      .find({ trainerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return items.map((item) => this.mapToEntity(item));
  }

  async findReviewByClientAndTrainer(
    clientId: string,
    trainerId: string
  ): Promise<IReviewEntity | null> {
    return this.findOneAndMap({ clientId, trainerId });
  }
}