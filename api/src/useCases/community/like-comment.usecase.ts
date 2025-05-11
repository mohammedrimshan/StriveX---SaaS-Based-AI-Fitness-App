import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { ILikeCommentUseCase } from "@/entities/useCaseInterfaces/community/like-comment-usecase.interface";

@injectable()
export class LikeCommentUseCase implements ILikeCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(commentId: string, userId: string): Promise<ICommentEntity> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const hasLiked = comment.likes.includes(userId);
    const updatedComment = hasLiked
      ? await this.commentRepository.removeLike(commentId, userId)
      : await this.commentRepository.addLike(commentId, userId);

    if (!updatedComment) throw new Error("Failed to update like");
    return updatedComment;
  }
}