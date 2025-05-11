import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { IDeleteCommentUseCase } from "@/entities/useCaseInterfaces/community/delete-comment-usecase.interface";


@injectable()
export class DeleteCommentUseCase implements IDeleteCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository,
    @inject("IAdminRepository") private adminRepository: IAdminRepository
  ) {}

  async execute(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const isAdmin = await this.adminRepository.findById(userId);
    if (comment.authorId !== userId && !isAdmin) throw new Error("Unauthorized");

    return this.commentRepository.update(commentId, { isDeleted: true }) !== null;
  }
}