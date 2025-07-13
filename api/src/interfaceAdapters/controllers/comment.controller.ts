import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ICommentController } from "@/entities/controllerInterfaces/comment-controller.interface";
import { ICreateCommentUseCase } from "@/entities/useCaseInterfaces/community/create-comment-usecase.interface";
import { ILikeCommentUseCase } from "@/entities/useCaseInterfaces/community/like-comment-usecase.interface";
import { IDeleteCommentUseCase } from "@/entities/useCaseInterfaces/community/delete-comment-usecase.interface";
import { IReportCommentUseCase } from "@/entities/useCaseInterfaces/community/report-comment-usecase.interface";
import { IGetCommentsUseCase } from "@/entities/useCaseInterfaces/community/get-comments-usecase.interface";
import {
  SocketService,
} from "@/interfaceAdapters/services/socket.service";
import { FrontendComment } from "@/entities/models/socket.entity";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  RoleType,
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
    private _reportCommentUseCase: IReportCommentUseCase,
    @inject("IGetCommentsUseCase")
    private _getCommentsUseCase: IGetCommentsUseCase,
    @inject("SocketService") private _socketService: SocketService
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
      if (!textContent) {
        throw new CustomError(
          "Comment content is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const comment = await this._createCommentUseCase.execute(
        { textContent, postId },
        req.user!.id
      );

      let author: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
      } | null = null;
      const role = req.user!.role as RoleType;
      if (role === "client") {
        const client = await this._socketService["_clientRepository"].findById(
          req.user!.id
        );
        if (client && client.id) {
          author = {
            _id: client.id.toString(),
            firstName: client.firstName || "Unknown",
            lastName: client.lastName || "",
            email: client.email || "",
            profileImage: client.profileImage || undefined,
          };
        } else {
          throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
        }
      } else if (role === "trainer") {
        const trainer = await this._socketService[
          "_trainerRepository"
        ].findById(req.user!.id);
        if (trainer && trainer.id) {
          author = {
            _id: trainer.id.toString(),
            firstName: trainer.firstName || "Unknown",
            lastName: trainer.lastName || "",
            email: trainer.email || "",
            profileImage: trainer.profileImage || undefined,
          };
        } else {
          throw new CustomError("Trainer not found", HTTP_STATUS.NOT_FOUND);
        }
      } else if (role === "admin") {
        author = {
          _id: req.user!.id,
          firstName: "Admin",
          lastName: "",
          email: "admin@example.com",
          profileImage: undefined,
        };
      }

      if (!author) {
        throw new CustomError(
          "Failed to fetch author details",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }

      const frontendComment: FrontendComment = {
        id: comment.id ?? "",
        postId: comment.postId,
        authorId: comment.authorId,
        author,
        textContent: comment.textContent,
        likes: comment.likes || [],
        isDeleted: comment.isDeleted || false,
        createdAt: comment.createdAt.toISOString(),
      };

      const io = this._socketService.getIO();
      io.to("community").emit("newComment", frontendComment);

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
      handleErrorResponse(req,res, error);
    }
  }

  async getComments(req: Request, res: Response): Promise<void> {
    try {
      const { id: postId } = req.params;
      const { page = "1", limit = "10" } = req.query;

      if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items: comments, total } = await this._getCommentsUseCase.execute(
        postId,
        pageNum,
        limitNum
      );

      const commentsWithAuthor = await Promise.all(
        comments.map(async (comment) => {
          let author: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            profileImage?: string;
          } | null = null;
          const role = comment.authorId
            ? await this._socketService.getUserRole(comment.authorId)
            : null;
          if (role === "client") {
            const client = await this._socketService[
              "_clientRepository"
            ].findById(comment.authorId);
            if (client && client.id) {
              author = {
                _id: client.id.toString(),
                firstName: client.firstName || "Unknown",
                lastName: client.lastName || "",
                email: client.email || "",
                profileImage: client.profileImage || undefined,
              };
            }
          } else if (role === "trainer") {
            const trainer = await this._socketService[
              "_trainerRepository"
            ].findById(comment.authorId);
            if (trainer && trainer.id) {
              author = {
                _id: trainer.id.toString(),
                firstName: trainer.firstName || "Unknown",
                lastName: trainer.lastName || "",
                email: trainer.email || "",
                profileImage: trainer.profileImage || undefined,
              };
            }
          } 

          return {
            ...comment,
            author,
          };
        })
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        data: {
          comments: commentsWithAuthor,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
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
      handleErrorResponse(req,res, error);
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
      if (comment.isDeleted) {
        throw new CustomError(
          "Cannot like a deleted comment",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const io = this._socketService.getIO();
      io.to("community").emit("commentLiked", {
        commentId: id,
        userId: req.user!.id,
        likes: comment.likes || [],
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        comment,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
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

      const io = this._socketService.getIO();
      io.to("community").emit("commentDeleted", { commentId: id });

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
      handleErrorResponse(req,res, error);
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
      if (!reason) {
        throw new CustomError(
          "Report reason is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

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
      handleErrorResponse(req,res, error);
    }
  }
}
