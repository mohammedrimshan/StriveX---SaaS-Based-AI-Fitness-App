import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { ICreateReviewUseCase } from "@/entities/useCaseInterfaces/review/create-review-usecase.interface";
import { IUpdateReviewUseCase } from "@/entities/useCaseInterfaces/review/update-review-usecase.interface";
import { IGetTrainerReviewsUseCase } from "@/entities/useCaseInterfaces/review/get-trainer-reviews-usecase.interface";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { IReviewController } from "@/entities/controllerInterfaces/review-controller.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
@injectable()
export class ReviewController implements IReviewController {
  constructor(
    @inject("ICreateReviewUseCase") private createReviewUseCase: ICreateReviewUseCase,
    @inject("IUpdateReviewUseCase") private updateReviewUseCase: IUpdateReviewUseCase,
    @inject("IGetTrainerReviewsUseCase") private getTrainerReviewsUseCase: IGetTrainerReviewsUseCase
  ) {}

  async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const { clientId, trainerId, rating, comment } = req.body;
      const review = await this.createReviewUseCase.execute(clientId, trainerId, rating, comment);
      res.status(201).json({
        success: true,
        data: review,
        message: "Review submitted successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    try {

      const clientId = req.user?.id; 
      const { reviewId,  rating, comment } = req.body;
       if (!clientId) {
        throw new CustomError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
      }

      const updatedReview = await this.updateReviewUseCase.execute(reviewId, clientId, rating, comment);
      res.status(200).json({
        success: true,
        data: updatedReview,
        message: "Review updated successfully",
      });
    } catch (error) {
     handleErrorResponse(res, error);
    }
  }

 async getTrainerReviews(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const { skip = 0, limit = 10 } = req.query;
      const reviews = await this.getTrainerReviewsUseCase.execute(
        trainerId,
        Number(skip),
        Number(limit)
      );
      res.status(200).json({
        success: true,
        data: reviews,
        message: "Reviews retrieved successfully",
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}