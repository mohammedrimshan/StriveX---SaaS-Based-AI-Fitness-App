import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPostController } from "@/entities/controllerInterfaces/post-controller.interface";
import { ICreatePostUseCase } from "@/entities/useCaseInterfaces/community/create-post-usecase.interface";
import { IGetPostsUseCase } from "@/entities/useCaseInterfaces/community/get-posts-usecase.interface";
import { IGetPostUseCase } from "@/entities/useCaseInterfaces/community/get-post-usecase.interface";
import { IDeletePostUseCase } from "@/entities/useCaseInterfaces/community/delete-post-usecase.interface";
import { ILikePostUseCase } from "@/entities/useCaseInterfaces/community/like-post-usecase.interface";
import { IReportPostUseCase } from "@/entities/useCaseInterfaces/community/report-post-usecase.interface";
import { SocketService } from "../services/socket.service";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import mongoose from "mongoose";

@injectable()
export class PostController implements IPostController {
  constructor(
    @inject("ICreatePostUseCase")
    private _createPostUseCase: ICreatePostUseCase,
    @inject("IGetPostsUseCase") private _getPostsUseCase: IGetPostsUseCase,
    @inject("IGetPostUseCase") private _getPostUseCase: IGetPostUseCase,
    @inject("IDeletePostUseCase")
    private _deletePostUseCase: IDeletePostUseCase,
    @inject("ILikePostUseCase") private _likePostUseCase: ILikePostUseCase,
    @inject("IReportPostUseCase") private _reportPostUseCase: IReportPostUseCase,
    @inject("SocketService") private _socketService : SocketService
  ) {}

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { textContent, mediaUrl } = req.body as {
        textContent: string;
        mediaUrl?: string;
      };
      if (!textContent)
        throw new CustomError(
          "Post content is required",
          HTTP_STATUS.BAD_REQUEST
        );

      const post = await this._createPostUseCase.execute(
        { textContent, mediaUrl },
        req.user!.id
      );

      const io = this._socketService.getIO()
      io.emit("newPost",{
        id:post.id,
        authorId: post.authorId,
        textContent: post.textContent,
        mediaUrl: post.mediaUrl,
        category: post.category,
        createdAt: post.createdAt,
      })

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        post,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const { category, sortBy, skip = 0, limit = 10 } = req.query;
      const skipNumber = Number(skip);
      const limitNumber = Number(limit);

      if (
        isNaN(skipNumber) ||
        isNaN(limitNumber) ||
        skipNumber < 0 ||
        limitNumber < 1
      ) {
        throw new CustomError(
          "Invalid skip or limit parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const posts = await this._getPostsUseCase.execute(
        { category: category as string, sortBy: sortBy as any },
        skipNumber,
        limitNumber
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        posts: posts.items,
        totalPosts: posts.total,
        currentSkip: skipNumber,
        limit: limitNumber,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const post = await this._getPostUseCase.execute(id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        post,
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

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._deletePostUseCase.execute(id, req.user!.id);

      const io = this._socketService.getIO();
      io.emit("postDeleted", { postId: id });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized to delete post",
          error: "UNAUTHORIZED",
        });
        return;
      }
      handleErrorResponse(res, error);
    }
  }

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_ID,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const post = await this._likePostUseCase.execute(id, req.user!.id);

      const io = this._socketService.getIO();
      io.emit("postLiked", { postId: id, userId: req.user!.id, likes: post.likes });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        post,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async reportPost(req: Request, res: Response): Promise<void> {
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

      const post = await this._reportPostUseCase.execute(
        id,
        req.user!.id,
        reason
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        post,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
