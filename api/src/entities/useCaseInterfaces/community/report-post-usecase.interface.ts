import { IPostEntity } from "@/entities/models/post.entity";

export interface IReportPostUseCase {
  execute(postId: string, userId: string, reason: string): Promise<IPostEntity>;
}
