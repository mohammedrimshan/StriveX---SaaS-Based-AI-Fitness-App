import { ICommentEntity } from "@/entities/models/comment.entity";

export interface ILikeCommentUseCase {
  execute(commentId: string, userId: string): Promise<ICommentEntity>;
}
