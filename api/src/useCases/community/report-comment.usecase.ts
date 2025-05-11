import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { IReportCommentUseCase } from "@/entities/useCaseInterfaces/community/report-comment-usecase.interface";


@injectable()
export class ReportCommentUseCase implements IReportCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(commentId: string, userId: string, reason: string): Promise<ICommentEntity> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const report = { userId, reason, reportedAt: new Date() };
    const updatedComment = await this.commentRepository.addReport(commentId, report);
    if (!updatedComment) throw new Error("Failed to report comment");

    return updatedComment;
  }
}