import { ICommentEntity } from "@/entities/models/comment.entity";
import { IBaseRepository } from "@/entities/repositoryInterfaces/base-repository.interface";

export interface ICommentRepository extends IBaseRepository<ICommentEntity> {
  findByPostId(postId: string, skip: number, limit: number): Promise<{ items: ICommentEntity[]; total: number }>;
  addLike(commentId: string, userId: string): Promise<ICommentEntity | null>;
  removeLike(commentId: string, userId: string): Promise<ICommentEntity | null>;
  addReport(commentId: string, report: ICommentEntity['reports'][0]): Promise<ICommentEntity | null>;
  findReportedComments(): Promise<ICommentEntity[]>;
}
