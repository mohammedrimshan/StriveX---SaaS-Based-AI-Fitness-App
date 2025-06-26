import { injectable } from "tsyringe";
import { CommentModel } from "@/frameworks/database/mongoDB/models/command.model";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { BaseRepository } from "@/interfaceAdapters/repositories/base.repository";

@injectable()
export class CommentRepository
  extends BaseRepository<ICommentEntity>
  implements ICommentRepository
{
  constructor() {
    super(CommentModel);
  }

  async findByPostId(
    postId: string,
    skip: number,
    limit: number
  ): Promise<{ items: ICommentEntity[]; total: number }> {
    const [items, total] = await Promise.all([
      this.model
        .find({ postId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ postId, isDeleted: false }),
    ]);
    const transformedItems = items.map((item) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }

  async addLike(
    commentId: string,
    userId: string
  ): Promise<ICommentEntity | null> {
    const comment = await this.model
      .findByIdAndUpdate(
        commentId,
        { $addToSet: { likes: userId } },
        { new: true }
      )
      .lean();
    return comment ? this.mapToEntity(comment) : null;
  }

  async removeLike(
    commentId: string,
    userId: string
  ): Promise<ICommentEntity | null> {
    const comment = await this.model
      .findByIdAndUpdate(commentId, { $pull: { likes: userId } }, { new: true })
      .lean();
    return comment ? this.mapToEntity(comment) : null;
  }

  async addReport(
    commentId: string,
    report: ICommentEntity["reports"][0]
  ): Promise<ICommentEntity | null> {
    const comment = await this.model
      .findByIdAndUpdate(
        commentId,
        { $push: { reports: report } },
        { new: true }
      )
      .lean();
    return comment ? this.mapToEntity(comment) : null;
  }

  async findReportedComments(): Promise<ICommentEntity[]> {
    const comments = await this.model
      .find({ "reports.0": { $exists: true } })
      .lean();
    return comments.map((comment) => this.mapToEntity(comment));
  }
}
