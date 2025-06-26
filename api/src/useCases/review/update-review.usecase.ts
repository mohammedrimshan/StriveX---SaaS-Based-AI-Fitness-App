import { injectable, inject } from "tsyringe";
import { IUpdateReviewUseCase } from "@/entities/useCaseInterfaces/review/update-review-usecase.interface";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IReviewEntity } from "@/entities/models/review.entity";
import { TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(
    reviewId: string,
    clientId: string,
    rating: number,
    comment?: string
  ): Promise<IReviewEntity> {
    const client = await this.clientRepository.findById(clientId);
    console.log(client, "update review");
    if (!client) {
      throw new Error("Client not found");
    }
    if (!client.isPremium) {
      throw new Error("Only premium clients can update reviews");
    }

    const review = await this.reviewRepository.findReviewByClientAndTrainer(
      clientId,
      client.selectedTrainerId!
    );
    if (!review || review.id !== reviewId) {
      throw new Error("Review not found or not authorized to update");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const updatedReview = await this.reviewRepository.updateReview(reviewId, {
      rating,
      comment,
      updatedAt: new Date(),
    });

    if (!updatedReview) {
      throw new Error("Failed to update review");
    }

    await this.updateTrainerRating(review.trainerId);

    return updatedReview;
  }

  private async updateTrainerRating(trainerId: string): Promise<void> {
    const { items: reviews } =
      await this.reviewRepository.findReviewsByTrainerId(trainerId, 0, 0);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    await this.trainerRepository.findByIdAndUpdate(trainerId, {
      rating: averageRating,
      reviewCount,
    });
  }
}
