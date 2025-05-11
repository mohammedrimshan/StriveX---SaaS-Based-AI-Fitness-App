import { IPostEntity } from "@/entities/models/post.entity";

export interface IGetReportedPostsUseCase {
  execute(): Promise<IPostEntity[]>;
}