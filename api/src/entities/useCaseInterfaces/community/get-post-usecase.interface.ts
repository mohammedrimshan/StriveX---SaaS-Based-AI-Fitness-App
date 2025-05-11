import { IPostEntity } from "@/entities/models/post.entity";

export interface IGetPostUseCase {
  execute(postId: string): Promise<{ post: IPostEntity; comments: { items: any[]; total: number } }>;
}
