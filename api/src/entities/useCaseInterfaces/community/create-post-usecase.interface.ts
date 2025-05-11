import { IPostEntity } from "@/entities/models/post.entity";

export interface ICreatePostUseCase {
  execute(data: Partial<IPostEntity>, userId: string): Promise<IPostEntity>;
}
