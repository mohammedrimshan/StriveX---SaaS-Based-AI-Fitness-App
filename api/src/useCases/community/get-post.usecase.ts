import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IGetPostUseCase } from "@/entities/useCaseInterfaces/community/get-post-usecase.interface";
@injectable()
export class GetPostUseCase implements IGetPostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository,
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(postId: string): Promise<{ post: IPostEntity; comments: { items: any[]; total: number } }> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    const comments = await this.commentRepository.findByPostId(postId, 0, 10);
    return { post, comments };
  }
}
