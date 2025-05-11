import { IPostEntity } from "@/entities/models/post.entity";

export interface IGetPostsUseCase {
  execute(
    filter: { category?: string; sortBy?: 'latest' | 'likes' | 'comments' },
    skip: number,
    limit: number
  ): Promise<{ items: IPostEntity[]; total: number }>;
}
