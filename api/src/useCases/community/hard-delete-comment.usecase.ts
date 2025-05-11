import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IHardDeleteCommentUseCase } from "@/entities/useCaseInterfaces/community/hard-delete-comment-usecase.interface";
@injectable()
export class HardDeleteCommentUseCase implements IHardDeleteCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(commentId: string): Promise<boolean> {
    return this.commentRepository.delete(commentId);
  }
}