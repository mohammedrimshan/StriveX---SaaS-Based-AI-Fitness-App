import { ICommentEntity } from "@/entities/models/comment.entity";

export interface ICreateCommentUseCase {
  execute(data: Partial<ICommentEntity>, userId: string): Promise<ICommentEntity>;
}
