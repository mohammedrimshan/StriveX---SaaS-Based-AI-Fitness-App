import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IGetPostsUseCase } from "@/entities/useCaseInterfaces/community/get-posts-usecase.interface";


@injectable()
export class GetPostsUseCase implements IGetPostsUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(
    filter: { category?: string; sortBy?: "latest" | "likes" | "comments" },
    skip: number,
    limit: number
  ): Promise<{ items: IPostEntity[]; total: number }> {
    return this.postRepository.findWithFilters(filter, skip, limit);
  }
}
