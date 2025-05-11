import { ICommentEntity } from "@/entities/models/comment.entity";

export interface IGetReportedCommentsUseCase {
  execute(): Promise<ICommentEntity[]>;
}
