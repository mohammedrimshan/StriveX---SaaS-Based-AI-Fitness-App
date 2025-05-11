import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ICommentController } from "@/entities/controllerInterfaces/comment-controller.interface";
import { ICreateCommentUseCase } from "@/entities/useCaseInterfaces/community/create-comment-usecase.interface";
import { ILikeCommentUseCase } from "@/entities/useCaseInterfaces/community/like-comment-usecase.interface";
import { IDeleteCommentUseCase } from "@/entities/useCaseInterfaces/community/delete-comment-usecase.interface";
import { IReportCommentUseCase } from "@/entities/useCaseInterfaces/community/report-comment-usecase.interface";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import mongoose from "mongoose";

@injectable()
export class CommentController implements ICommentController {
  constructor(
    @inject("ICreateCommentUseCase")
    private _createCommentUseCase: ICreateCommentUseCase,
    @inject("ILikeCommentUseCase")
    private _likeCommentUseCase: ILikeCommentUseCase,
    @inject("IDeleteCommentUseCase")
    private _deleteCommentUseCase: IDeleteCommentUseCase,
    @inject("IReportCommentUseCase")
    private _reportCommentUseCase: IReportCommentUseCase
  ) {}

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { id: postId } = req.params;
      const { textContent } = req.body as { textContent: string };
      if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      if (!textContent)
        throw new CustomError(
          "Comment content is required",
          HTTP_STATUS.BAD_REQUEST
        );

      const comment = await this._createCommentUseCase.execute(
        { textContent, postId },
        req.user!.id
      );
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        comment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Post not found") {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Post not found",
          error: "POST_NOT_FOUND",
        });
        return;
      }
      handleErrorResponse(res, error);
    }
  }

  async likeComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const comment = await this._likeCommentUseCase.execute(id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        comment,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._deleteCommentUseCase.execute(id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized to delete comment",
          error: "UNAUTHORIZED",
        });
        return;
      }
      handleErrorResponse(res, error);
    }
  }

  async reportComment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      if (!reason)
        throw new CustomError(
          "Report reason is required",
          HTTP_STATUS.BAD_REQUEST
        );

      const comment = await this._reportCommentUseCase.execute(
        id,
        req.user!.id,
        reason
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        comment,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
