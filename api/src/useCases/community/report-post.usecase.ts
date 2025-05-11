import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IReportPostUseCase } from "@/entities/useCaseInterfaces/community/report-post-usecase.interface";

@injectable()
export class ReportPostUseCase implements IReportPostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository
  ) {}

  async execute(
    postId: string,
    userId: string,
    reason: string
  ): Promise<IPostEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    const report = { userId, reason, reportedAt: new Date() };
    const updatedPost = await this.postRepository.addReport(postId, report);
    if (!updatedPost) throw new Error("Failed to report post");
    return updatedPost;
  }
}
