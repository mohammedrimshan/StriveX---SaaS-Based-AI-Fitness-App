import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { ICreateCommentUseCase } from "@/entities/useCaseInterfaces/community/create-comment-usecase.interface";
@injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository,
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(data: Partial<ICommentEntity>, userId: string): Promise<ICommentEntity> {
    const post = await this.postRepository.findById(data.postId!);
    if (!post) throw new Error("Post not found");

    const commentData: Partial<ICommentEntity> = {
      ...data,
      authorId: userId,
      likes: [],
      isDeleted: false,
      reports: [],
    };

    return this.commentRepository.save(commentData);
  }
}
