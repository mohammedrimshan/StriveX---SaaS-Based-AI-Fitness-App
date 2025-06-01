import { injectable } from "tsyringe";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { MessageModel } from "@/frameworks/database/mongoDB/models/message.model";
import { BaseRepository } from "../base.repository";
import { IMessageEntity } from "@/entities/models/message.entity";
import { PipelineStage } from "mongoose";

@injectable()
export class MessageRepository
  extends BaseRepository<IMessageEntity>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  async getConversation(
    user1Id: string,
    user2Id: string,
    skip: number,
    limit: number
  ): Promise<{ items: IMessageEntity[]; total: number }> {
    const filter = {
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      deleted: false,
    };

    const rawItems = await this.model.find(filter).lean();

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    const transformedItems = items.map((item) => this.mapToEntity(item));

    return {
      items: transformedItems,
      total,
    };
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    await this.model.updateMany(
      { senderId, receiverId, status: "sent" },
      { $set: { status: "read", readAt: new Date() } }
    );
  }

  async getUnreadCount(receiverId: string, senderId?: string): Promise<number> {
    const filter: any = {
      receiverId,
      status: "sent",
      deleted: false,
    };

    if (senderId) {
      filter.senderId = senderId;
    }

    const count = await this.model.countDocuments(filter);
    return count;
  }

  async getRecentChats(
    userId: string,
    limit: number
  ): Promise<
    Array<{ userId: string; lastMessage: IMessageEntity; unreadCount: number }>
  > {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          deleted: false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userId] },
                    { $eq: ["$status", "sent"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          lastMessage: {
            _id: "$lastMessage._id",
            senderId: "$lastMessage.senderId",
            receiverId: "$lastMessage.receiverId",
            message: "$lastMessage.message",
            status: "$lastMessage.status",
            createdAt: "$lastMessage.createdAt",
            updatedAt: "$lastMessage.updatedAt",
            type: "$lastMessage.type",
            mediaUrl: "$lastMessage.mediaUrl",
            reactions: "$lastMessage.reactions",
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $limit: limit,
      },
    ];

    const results = await this.model.aggregate(pipeline).exec();

    return results.map((result) => ({
      userId: result.userId,
      lastMessage: this.mapToEntity(result.lastMessage),
      unreadCount: result.unreadCount,
    }));
  }

  protected mapToEntity(doc: any): IMessageEntity {
    const { _id, __v, ...rest } = doc;
    if (!_id) {
      throw new Error("Message document missing _id");
    }
    const entity = {
      ...rest,
      id: _id.toString(),
      reactions: rest.reactions || [],
    } as IMessageEntity;
    return entity;
  }
}
