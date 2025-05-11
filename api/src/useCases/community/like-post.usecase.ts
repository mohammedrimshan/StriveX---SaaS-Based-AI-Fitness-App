import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { ILikePostUseCase } from "@/entities/useCaseInterfaces/community/like-post-usecase.interface";

@injectable()
export class LikePostUseCase implements ILikePostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(postId: string, userId: string): Promise<IPostEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    const hasLiked = post.likes.includes(userId);
    const updatedPost = hasLiked
      ? await this.postRepository.removeLike(postId, userId)
      : await this.postRepository.addLike(postId, userId);

    if (!updatedPost) throw new Error("Failed to update like");
    return updatedPost;
  }
}
