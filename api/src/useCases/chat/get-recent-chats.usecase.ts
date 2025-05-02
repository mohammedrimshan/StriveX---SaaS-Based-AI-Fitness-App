// D:\StriveX\api\src\useCases\chat\get-recent-chats.usecase.ts
import { inject, injectable } from "tsyringe";
import { IGetRecentChatsUseCase } from "@/entities/useCaseInterfaces/chat/get-recent-chats-usecase.interface";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IMessageEntity } from "@/entities/models/message.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, ROLES } from "@/shared/constants";

@injectable()
export class GetRecentChatsUseCase implements IGetRecentChatsUseCase {
  constructor(
    @inject("IMessageRepository")
    private _messageRepository: IMessageRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("SocketService") private _socketService: any 
  ) {}

  async execute(userId: string, limit: number): Promise<Array<{
    userId: string;
    lastMessage: IMessageEntity;
    unreadCount: number;
    participants: Array<{
      id: string;
      name: string;
      avatar: string;
      status: "online" | "offline";
    }>;
  }>> {
    if (!userId) {
      throw new CustomError(ERROR_MESSAGES.ID_NOT_PROVIDED, HTTP_STATUS.BAD_REQUEST);
    }
  
    if (limit < 1) {
      throw new CustomError("Invalid limit parameter", HTTP_STATUS.BAD_REQUEST);
    }

    // Fetch the requesting user's details first
    let currentUserName = "Unknown";
    let currentUserAvatar = "";
    let currentUserStatus: "online" | "offline" = "offline";

    const currentClient = await this._clientRepository.findByClientId(userId);
    console.log(`Current user client lookup for ${userId}: ${JSON.stringify(currentClient)}`);
    if (currentClient) {
      currentUserName = `${currentClient.firstName} ${currentClient.lastName}`;
      currentUserAvatar = currentClient.profileImage || "";
    } else {
      const currentTrainer = await this._trainerRepository.findById(userId);
      console.log(`Current user trainer lookup for ${userId}: ${JSON.stringify(currentTrainer)}`);
      if (currentTrainer) {
        currentUserName = `${currentTrainer.firstName} ${currentTrainer.lastName}`;
        currentUserAvatar = currentTrainer.profileImage || "";
      } else {
        console.warn(`Current user not found for ID: ${userId} in client or trainer collections`);
      }
    }

    const currentSocketId = this._socketService.getSocketId(userId);
    console.log(`Current user socket lookup for ${userId}: ${currentSocketId}`);
    if (currentSocketId && this._socketService.getIO().sockets.sockets.get(currentSocketId)) {
      currentUserStatus = "online";
    }

    const chats = await this._messageRepository.getRecentChats(userId, limit);
  
    return await Promise.all(
      chats.map(async (chat: any) => {
        const otherUserId = chat.userId;
        let participantName = "Unknown";
        let participantAvatar = "";
        let participantStatus: "online" | "offline" = "offline";

        const client = await this._clientRepository.findByClientId(otherUserId);
        console.log(`Client lookup for ${otherUserId}: ${JSON.stringify(client)}`);
        if (client) {
          participantName = `${client.firstName} ${client.lastName}`;
          participantAvatar = client.profileImage || "";
        } else {
          const trainer = await this._trainerRepository.findById(otherUserId);
          console.log(`Trainer lookup for ${otherUserId}: ${JSON.stringify(trainer)}`);
          if (trainer) {
            participantName = `${trainer.firstName} ${trainer.lastName}`;
            participantAvatar = trainer.profileImage || "";
          } else {
            console.warn(`No user found for ID: ${otherUserId} in client or trainer collections`);
          }
        }

        const socketId = this._socketService.getSocketId(otherUserId);
        console.log(`Socket lookup for ${otherUserId}: ${socketId}`);
        if (socketId && this._socketService.getIO().sockets.sockets.get(socketId)) {
          participantStatus = "online";
        }

        return {
          userId: otherUserId,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
          participants: [
            {
              id: userId,
              name: currentUserName,
              avatar: currentUserAvatar,
              status: currentUserStatus,
            },
            {
              id: otherUserId,
              name: participantName,
              avatar: participantAvatar,
              status: participantStatus,
            },
          ],
        };
      })
    );
  }

  private async determineRole(userId: string): Promise<string> {
    const client = await this._clientRepository.findById(userId);
    if (client) return ROLES.USER;
    const trainer = await this._trainerRepository.findById(userId);
    if (trainer) return ROLES.TRAINER;
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }
}