import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { IGetReportedCommentsUseCase } from "@/entities/useCaseInterfaces/community/get-reported-comments-usecase.interface";

@injectable()
export class GetReportedCommentsUseCase implements IGetReportedCommentsUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(): Promise<ICommentEntity[]> {
    return this.commentRepository.findReportedComments();
  }
}
