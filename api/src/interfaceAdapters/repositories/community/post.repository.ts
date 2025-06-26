import { injectable } from "tsyringe";
import { PostModel } from "@/frameworks/database/mongoDB/models/post.model";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { BaseRepository } from "@/interfaceAdapters/repositories/base.repository";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class PostRepository
  extends BaseRepository<IPostEntity>
  implements IPostRepository
{
  constructor() {
    super(PostModel);
  }

  protected mapToEntity(doc: any): IPostEntity {
    const { _id, __v, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      author: doc.author || null,
      commentsCount: doc.commentsCount || 0,
      likes: doc.likes || [],
      reports: doc.reports || [],
      isDeleted: doc.isDeleted || false,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      textContent: doc.textContent || "",
      category: doc.category || "",
      authorId: doc.authorId || "",
      role: doc.role || "client",
    } as IPostEntity;
  }

  async findByAuthorId(
    authorId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IPostEntity[]; total: number }> {
    try {
      const [items, total] = await Promise.all([
        this.model
          .find({ authorId, isDeleted: false })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.model.countDocuments({ authorId, isDeleted: false }),
      ]);
      const transformedItems = items.map((item) => this.mapToEntity(item));
      return { items: transformedItems, total };
    } catch (error) {
      throw new CustomError(
        "Failed to find posts by author ID",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findWithFilters(
    filter: { category?: string; sortBy?: "latest" | "likes" | "comments" },
    skip: number,
    limit: number
  ): Promise<{ items: IPostEntity[]; total: number }> {
    try {
      const query: any = { isDeleted: false };
      if (filter.category) query.category = filter.category;

      let sort: any = { createdAt: -1 };
      if (filter.sortBy === "likes") sort = { "likes.length": -1 };
      else if (filter.sortBy === "comments") sort = { commentsCount: -1 };

      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments",
          },
        },
        {
          $addFields: {
            authorIdObjectId: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: "$authorId",
                    regex: /^[0-9a-fA-F]{24}$/,
                  },
                },
                then: { $toObjectId: "$authorId" },
                else: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: "trainers",
            localField: "authorIdObjectId",
            foreignField: "_id",
            as: "trainerInfo",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  profileImage: 1,
                  email: 1,
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "authorIdObjectId",
            foreignField: "_id",
            as: "clientInfo",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  profileImage: 1,
                  role: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            author: {
              $cond: {
                if: { $gt: [{ $size: "$trainerInfo" }, 0] },
                then: { $arrayElemAt: ["$trainerInfo", 0] },
                else: {
                  $cond: {
                    if: { $gt: [{ $size: "$clientInfo" }, 0] },
                    then: { $arrayElemAt: ["$clientInfo", 0] },
                    else: null,
                  },
                },
              },
            },
            commentsCount: { $size: "$comments" },
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            comments: 0,
            trainerInfo: 0,
            clientInfo: 0,
            authorIdObjectId: 0,
          },
        },
      ];

      const result = await this.model.aggregate(pipeline).exec();
      const total = await this.model.countDocuments(query);
      const transformedItems = result.map((item: any) =>
        this.mapToEntity(item)
      );

      return { items: transformedItems, total };
    } catch (error) {
      throw new CustomError(
        "Failed to execute aggregation pipeline",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addLike(postId: string, userId: string): Promise<IPostEntity | null> {
    try {
      const post = await this.model
        .findByIdAndUpdate(
          postId,
          { $addToSet: { likes: userId } },
          { new: true }
        )
        .lean();
      return post ? this.mapToEntity(post) : null;
    } catch (error) {
      throw new CustomError(
        "Failed to add like",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeLike(
    postId: string,
    userId: string
  ): Promise<IPostEntity | null> {
    try {
      const post = await this.model
        .findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
        .lean();
      return post ? this.mapToEntity(post) : null;
    } catch (error) {
      throw new CustomError(
        "Failed to remove like",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addReport(
    postId: string,
    report: IPostEntity["reports"][0]
  ): Promise<IPostEntity | null> {
    try {
      const post = await this.model
        .findByIdAndUpdate(
          postId,
          { $push: { reports: report } },
          { new: true }
        )
        .lean();
      return post ? this.mapToEntity(post) : null;
    } catch (error) {
      throw new CustomError(
        "Failed to add report",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findReportedPosts(): Promise<IPostEntity[]> {
    try {
      const posts = await this.model
        .find({ "reports.0": { $exists: true } })
        .lean();
      return posts.map((post) => this.mapToEntity(post));
    } catch (error) {
      throw new CustomError(
        "Failed to find reported posts",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
