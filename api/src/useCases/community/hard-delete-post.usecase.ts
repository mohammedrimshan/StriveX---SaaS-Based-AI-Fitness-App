import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IHardDeletePostUseCase } from "@/entities/useCaseInterfaces/community/hard-delete-post-usecase.interface";
@injectable()
export class HardDeletePostUseCase implements IHardDeletePostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(postId: string): Promise<boolean> {
    return this.postRepository.delete(postId);
  }
}