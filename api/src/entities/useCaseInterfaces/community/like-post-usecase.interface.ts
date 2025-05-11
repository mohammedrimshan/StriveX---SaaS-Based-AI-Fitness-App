import { IPostEntity } from "@/entities/models/post.entity";

export interface ILikePostUseCase {
  execute(postId: string, userId: string): Promise<IPostEntity>;
}
