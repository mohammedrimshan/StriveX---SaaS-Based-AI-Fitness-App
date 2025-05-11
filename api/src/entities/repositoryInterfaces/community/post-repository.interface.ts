import { IPostEntity } from "@/entities/models/post.entity";
import { IBaseRepository } from "@/entities/repositoryInterfaces/base-repository.interface";

export interface IPostRepository extends IBaseRepository<IPostEntity> {
  findByAuthorId(authorId: string, skip: number, limit: number): Promise<{ items: IPostEntity[]; total: number }>;
  findWithFilters(
    filter: { category?: string; sortBy?: 'latest' | 'likes' | 'comments' },
    skip: number,
    limit: number
  ): Promise<{ items: IPostEntity[]; total: number }>;
  addLike(postId: string, userId: string): Promise<IPostEntity | null>;
  removeLike(postId: string, userId: string): Promise<IPostEntity | null>;
  addReport(postId: string, report: IPostEntity['reports'][0]): Promise<IPostEntity | null>;
  findReportedPosts(): Promise<IPostEntity[]>;
}