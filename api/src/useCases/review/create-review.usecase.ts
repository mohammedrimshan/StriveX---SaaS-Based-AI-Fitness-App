import { injectable, inject } from "tsyringe";
import { ICreateReviewUseCase } from "@/entities/useCaseInterfaces/review/create-review-usecase.interface";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IReviewEntity } from "@/entities/models/review.entity";
import { TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class CreateReviewUseCase implements ICreateReviewUseCase {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(
    clientId: string,
    trainerId: string,
    rating: number,
    comment?: string
  ): Promise<IReviewEntity> {
    // Validate client eligibility
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    if (!client.isPremium) {
      throw new Error("Only premium clients can submit reviews");
    }
    if (client.selectedTrainerId !== trainerId || client.selectStatus !== TrainerSelectionStatus.ACCEPTED) {
      throw new Error("Client must have an approved selected trainer to submit a review");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findReviewByClientAndTrainer(clientId, trainerId);
    if (existingReview) {
      throw new Error("Client has already submitted a review for this trainer");
    }

    // Create review
    const reviewData: Partial<IReviewEntity> = {
      clientId,
      trainerId,
      rating,
      comment,
      clientProfileImage: client.profileImage,
      clientName: `${client.firstName} ${client.lastName}`.trim(),
    };

    const review = await this.reviewRepository.createReview(reviewData);

    // Update trainer's rating and reviewCount
    await this.updateTrainerRating(trainerId);

    return review;
  }

  private async updateTrainerRating(trainerId: string): Promise<void> {
    const { items: reviews } = await this.reviewRepository.findReviewsByTrainerId(trainerId, 0, 0);
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
      : 0;

    await this.trainerRepository.findByIdAndUpdate(trainerId, {
      rating: averageRating,
      reviewCount,
    });
  }
}