import { ICommentEntity } from "@/entities/models/comment.entity";

export interface IGetCommentsUseCase {
  execute(postId: string, page: number, limit: number): Promise<{ items: ICommentEntity[]; total: number }>;
}