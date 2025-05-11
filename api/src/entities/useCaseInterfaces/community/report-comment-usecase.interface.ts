import { ICommentEntity } from "@/entities/models/comment.entity";

export interface IReportCommentUseCase {
  execute(commentId: string, userId: string, reason: string): Promise<ICommentEntity>;
}
