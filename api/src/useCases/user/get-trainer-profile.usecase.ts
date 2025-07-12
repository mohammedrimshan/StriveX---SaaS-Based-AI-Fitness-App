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
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("IReviewRepository") private _reviewRepository: IReviewRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ISessionHistoryRepository")
    private _sessionHistoryRepository: ISessionHistoryRepository,
    @inject("ISlotRepository") private _slotRepository: ISlotRepository
  ) {}

  async execute(
    trainerId: string,
    clientId?: string
  ): Promise<TrainerProfileViewDto> {
 
    const trainer = await this._trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

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

    const [latestReviews, allReviews, performanceStats, availableSlots] =
      await Promise.all([
        this._reviewRepository.findLatestReviewsByTrainerId(trainerId, 3),
        this._reviewRepository.findReviewsByTrainerId(trainerId, 0, 0),
        this._sessionHistoryRepository.getPerformanceStats(trainerId),
        this._slotRepository.findAvailableSlots(trainerId),
      ]);

    const averageRating =
      allReviews.items.length > 0
        ? allReviews.items.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.items.length
        : 0;

    let canReview = false;
    if (clientId) {
      const client = await this._clientRepository.findById(clientId);
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
