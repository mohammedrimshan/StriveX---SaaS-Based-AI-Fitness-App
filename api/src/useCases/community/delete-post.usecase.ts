import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { IDeletePostUseCase } from "@/entities/useCaseInterfaces/community/delete-post-usecase.interface";

@injectable()
export class DeletePostUseCase implements IDeletePostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository,
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) {}

  async execute(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    const isAdmin = await this.adminRepository.findById(userId);
    if (post.authorId !== userId && !isAdmin) throw new Error("Unauthorized");

    return this.postRepository.update(postId, { isDeleted: true }) !== null;
  }
}