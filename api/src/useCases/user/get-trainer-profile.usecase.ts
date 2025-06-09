import { injectable, inject } from "tsyringe";
import { IGetTrainerProfileUseCase } from "@/entities/useCaseInterfaces/users/get-trainer-profile.usecase.interface";
import { TrainerProfileViewDto } from "@/shared/dto/rainer-profile-view.dto";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IReviewRepository } from "@/entities/repositoryInterfaces/review/review-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { TrainerSelectionStatus } from "@/shared/constants";
import { ISessionHistoryRepository } from "@/entities/repositoryInterfaces/session/session-history-repository.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";

@injectable()
export class GetTrainerProfileUseCase implements IGetTrainerProfileUseCase {
  constructor(
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ISessionHistoryRepository") private sessionHistoryRepository: ISessionHistoryRepository,
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(trainerId: string, clientId?: string): Promise<TrainerProfileViewDto> {
    console.log(clientId,"client from usecase get trainer profile");
    // Fetch trainer data
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Calculate age from dateOfBirth
    let age: number | undefined;
    if (trainer.dateOfBirth) {
      const dob = new Date(trainer.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      ) {
        age--;
      }
    }

    // Fetch reviews and stats
    const [latestReviews, allReviews, performanceStats, availableSlots] = await Promise.all([
        
      this.reviewRepository.findLatestReviewsByTrainerId(trainerId, 3),
      this.reviewRepository.findReviewsByTrainerId(trainerId, 0, 0),
      this.sessionHistoryRepository.getPerformanceStats(trainerId),
      this.slotRepository.findAvailableSlots(trainerId),
    ]);

    console.log(performanceStats,"performance stats");
    // Calculate average rating
    const averageRating =
      allReviews.items.length > 0
        ? allReviews.items.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.items.length
        : 0;

    // Determine canReview
    let canReview = false;
    if (clientId) {
      const client = await this.clientRepository.findById(clientId);
      console.log(client, "clientfrom usecase  get trainer profile");
      if (
        client &&
        client.isPremium &&
        client.selectedTrainerId === trainerId &&
        client.selectStatus === TrainerSelectionStatus.ACCEPTED
      ) {
        canReview = true;
      }
    }

    return {
      trainer: {
        id: trainer.id!,
        fullName: `${trainer.firstName} ${trainer.lastName}`.trim(),
        profileImage: trainer.profileImage,
        experience: trainer.experience,
        gender: trainer.gender,
        age,
        skills: trainer.skills,
        certifications: trainer.certifications,
      },
      reviews: {
        items: latestReviews,
        averageRating,
        totalReviewCount: allReviews.total,
        canReview,
      },
      performanceStats,
      availableSlots: availableSlots.map((slot) => ({
        slotId: slot.id!,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };
  }
}
