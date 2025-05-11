import { IPostEntity } from "@/entities/models/post.entity";

export interface IDeletePostUseCase {
  execute(postId: string, userId: string): Promise<boolean>;
}
