
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IGetChatHistoryUseCase } from "@/entities/useCaseInterfaces/chat/get-chat-history-usecase.interface";
import { IGetRecentChatsUseCase } from "@/entities/useCaseInterfaces/chat/get-recent-chats-usecase.interface";
import { IGetChatParticipantsUseCase } from "@/entities/useCaseInterfaces/chat/get-chat-participants-usecase.interface";
import { IValidateChatPermissionsUseCase } from "@/entities/useCaseInterfaces/chat/validate-chat-permissions-usecase.interface";
import { IDeleteMessageUseCase } from "@/entities/useCaseInterfaces/chat/delete-message-usecase.interface";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, ROLES } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { SocketService } from "@/interfaceAdapters/services/socket.service";
import { IChatController } from "@/entities/controllerInterfaces/chat.controller.interface";
@injectable()
export class ChatController implements IChatController {
  constructor(
    @inject("IGetChatHistoryUseCase")
    private _getChatHistoryUseCase: IGetChatHistoryUseCase,
    @inject("IGetRecentChatsUseCase")
    private _getRecentChatsUseCase: IGetRecentChatsUseCase,
    @inject("IGetChatParticipantsUseCase")
    private _getChatParticipantsUseCase: IGetChatParticipantsUseCase,
    @inject("IValidateChatPermissionsUseCase")
    private _validateChatPermissionsUseCase: IValidateChatPermissionsUseCase,
    @inject("IDeleteMessageUseCase")
    private _deleteMessageUseCase: IDeleteMessageUseCase,
    @inject("IMessageRepository")
    private _messageRepository: IMessageRepository,
    @inject("SocketService") private _socketService: SocketService
  ) {}

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { trainerId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId || !role) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!trainerId) {
        throw new CustomError(
          "Trainer ID not provided",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      await this._validateChatPermissionsUseCase.execute(
        userId,
        role,
        trainerId
      );

      const result = await this._getChatHistoryUseCase.execute(
        role === ROLES.USER ? userId : trainerId,
        role === ROLES.USER ? trainerId : userId,
        page,
        limit
      );

      const messages = result.items.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        text: msg.content,
        timestamp: msg.createdAt,
        read: msg.status === "read",
        media: msg.mediaUrl
          ? {
              type: msg.mediaType,
              url: msg.mediaUrl,
            }
          : undefined,
        replyToId: msg.replyToId,
        reactions: msg.reactions || [],
      }));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        messages,
        total: result.total,
        page,
        limit,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getRecentChats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId || !role) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const chats = await this._getRecentChatsUseCase.execute(userId, limit);

      const formattedChats = chats.map((chat) => ({
        id: `${userId}_${chat.userId}`,
        participants: [
          {
            id: chat.participants[0].id,
            name: chat.participants[0].name || "Unknown",
            avatar: chat.participants[0].avatar || "",
            status: chat.participants[0].status || "offline",
          },
          {
            id: chat.participants[1].id,
            name: chat.participants[1].name || "Unknown",
            avatar: chat.participants[1].avatar || "",
            status: chat.participants[1].status || "offline",
          },
        ],
        lastMessage: {
          id: chat.lastMessage.id,
          senderId: chat.lastMessage.senderId,
          text: chat.lastMessage.content,
          timestamp: chat.lastMessage.createdAt,
          read: chat.lastMessage.status === "read",
          media: chat.lastMessage.mediaUrl
            ? {
                type: chat.lastMessage.mediaType,
                url: chat.lastMessage.mediaUrl,
              }
            : undefined,
          replyToId: chat.lastMessage.replyToId,
          reactions: chat.lastMessage.reactions || [],
        },
        unreadCount: chat.unreadCount,
      }));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        chats: formattedChats,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getChatParticipants(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;

      console.log(role, "role in getChatParticipants");
      console.log(userId, "userId in getChatParticipants");

      if (!userId || !role) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const participants = await this._getChatParticipantsUseCase.execute(
        userId,
        role
      );

      console.log(participants, "participants in getChatParticipants");
      res.status(HTTP_STATUS.OK).json({
        success: true,
        participants,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      console.log(messageId, "messageId in deleteMessage");
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (messageId.startsWith("temp-")) {
        throw new CustomError("Invalid message ID", HTTP_STATUS.BAD_REQUEST);
      }

      await this._deleteMessageUseCase.execute(messageId, userId);

      const message = await this._messageRepository.findById(messageId);
      if (!message) {
        throw new CustomError("Message not found", HTTP_STATUS.NOT_FOUND);
      }

      const io = this._socketService.getIO();
      io.to(userId).emit("messageDeleted", { messageId });
      const receiverSocketId = this._socketService.getConnectedUser(
        message.receiverId
      )?.socketId;
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId });
      }

      res.status(HTTP_STATUS.OK).json({ success: true });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
