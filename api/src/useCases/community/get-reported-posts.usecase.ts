import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IGetReportedPostsUseCase } from "@/entities/useCaseInterfaces/community/get-reported-posts-usecase.interface";

@injectable()
export class GetReportedPostsUseCase implements IGetReportedPostsUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(): Promise<IPostEntity[]> {
    return this.postRepository.findReportedPosts();
  }
}