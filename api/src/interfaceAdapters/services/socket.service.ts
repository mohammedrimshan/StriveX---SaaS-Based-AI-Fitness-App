import { Server, Socket } from "socket.io";
import { inject, injectable } from "tsyringe";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IMessageEntity } from "@/entities/models/message.entity";
import { MessageStatus, ROLES, TrainerSelectionStatus } from "@/shared/constants";
import { v4 as uuidv4 } from "uuid";

interface UserSocket extends Socket {
  userId?: string;
  role?: string;
}

@injectable()
export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, { socketId: string; role: string }> = new Map();

  constructor(
    @inject("IMessageRepository") private _messageRepository: IMessageRepository,
    @inject("ICloudinaryService") private _cloudinaryService: ICloudinaryService,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {
    this.io = new Server({
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }

  initialize(server: any): void {
    this.io.attach(server);

    this.io.on("connection", (socket: UserSocket) => {
      console.log(`New socket connection established: ${socket.id}`);

      socket.on("register", async ({ userId, role }) => {
        if (!userId || !role || ![ROLES.USER, ROLES.TRAINER].includes(role)) {
          console.error(`Invalid registration attempt: userId=${userId}, role=${role}`);
          socket.emit("error", { message: "Invalid user ID or role" });
          socket.disconnect();
          return;
        }

        socket.userId = userId;
        socket.role = role;
        this.connectedUsers.set(userId, { socketId: socket.id, role });

        console.log(`User connected: userId=${userId}, role=${role}, socketId=${socket.id}`);

        // Notify user status (online/offline)
        await this.notifyUserStatus(userId, role, true);

        // Check and log if both trainer and client are connected
        this.logTrainerClientConnection(userId, role);
      });

      socket.on(
        "sendMessage",
        async (data: {
          senderId: string;
          receiverId: string;
          text?: string;
          media?: { type: "image" | "video" | "file"; base64: string; name?: string };
          replyToId?: string;
        }) => {
          if (!socket.userId || !socket.role) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          try {
            const { senderId, receiverId, text, media, replyToId } = data;

            const isValid = await this.validateRelationship(senderId, receiverId, socket.role);
            if (!isValid) {
              socket.emit("error", { message: "You can only message your connected trainer/client" });
              return;
            }

            let mediaUrl: string | undefined;
            let mediaType: string | null = null;

            if (media) {
              const uploadResult = await this._cloudinaryService.uploadFile(media.base64, {
                folder: `chat_media/${senderId}_${receiverId}`,
                resource_type: media.type === "file" ? "auto" : media.type,
              });
              mediaUrl = uploadResult.secure_url;
              mediaType = media.type;
            }

            const message: Partial<IMessageEntity> = {
              id: uuidv4(),
              senderId,
              receiverId,
              content: text || "",
              status: MessageStatus.SENT,
              mediaUrl,
              mediaType,
              replyToId,
              deleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              reactions: [],
            };

            const savedMessage = await this._messageRepository.save(message);

            const frontendMessage = this.mapToFrontendMessage(savedMessage);

            socket.emit("messageSent", frontendMessage);

            const receiverSocketId = this.connectedUsers.get(receiverId)?.socketId;
            if (receiverSocketId) {
              this.io.to(receiverSocketId).emit("receiveMessage", frontendMessage);
            }
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      socket.on("deleteMessage", async ({ messageId, receiverId }) => {
        if (!socket.userId) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }
        try {
          const message = await this._messageRepository.findById(messageId);
          if (!message || message.senderId !== socket.userId) {
            socket.emit("error", { message: "Unauthorized or message not found" });
            return;
          }

          await this._messageRepository.delete(messageId);
          socket.emit("messageDeleted", { messageId });

          const receiverSocketId = this.connectedUsers.get(receiverId)?.socketId;
          if (receiverSocketId) {
            this.io.to(receiverId).emit("messageDeleted", { messageId });
          }
        } catch (error) {
          console.error("Error deleting message:", error);
          socket.emit("error", { message: "Failed to delete message" });
        }
      });

      socket.on("addReaction", async ({ messageId, emoji, receiverId }) => {
        if (!socket.userId) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }
        try {
          const message = await this._messageRepository.findById(messageId);
          if (!message) {
            socket.emit("error", { message: "Message not found" });
            return;
          }

          const updatedMessage = await this._messageRepository.update(messageId, {
            reactions: [...(message.reactions || []), { userId: socket.userId, emoji }],
          });

          if (!updatedMessage) {
            socket.emit("error", { message: "Failed to add reaction" });
            return;
          }

          const frontendMessage = this.mapToFrontendMessage(updatedMessage);
          socket.emit("reactionAdded", frontendMessage);

          const receiverSocketId = this.connectedUsers.get(receiverId)?.socketId;
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("reactionAdded", frontendMessage);
          }
        } catch (error) {
          console.error("Error adding reaction:", error);
          socket.emit("error", { message: "Failed to add reaction" });
        }
      });

      socket.on("typing", ({ chatId, userId }) => {
        if (!socket.userId) return;
        const receiverId = this.getReceiverIdFromChatId(chatId, userId);
        if (receiverId) {
          const receiverSocketId = this.connectedUsers.get(receiverId)?.socketId;
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("typing", { chatId, userId });
          }
        }
      });

      socket.on("stopTyping", ({ chatId, userId }) => {
        if (!socket.userId) return;
        const receiverId = this.getReceiverIdFromChatId(chatId, userId);
        if (receiverId) {
          const receiverSocketId = this.connectedUsers.get(receiverId)?.socketId;
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("stopTyping", { chatId, userId });
          }
        }
      });

      socket.on("markAsRead", async ({ senderId, receiverId }) => {
        if (!socket.userId) return;
        try {
          await this._messageRepository.markMessagesAsRead(senderId, receiverId);
          socket.emit("messagesRead", { senderId, receiverId });

          const senderSocketId = this.connectedUsers.get(senderId)?.socketId;
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("messagesRead", { senderId, receiverId });
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("error", { message: "Failed to mark messages as read" });
        }
      });

      socket.on("checkConnection", () => {
        socket.emit("connectionStatus", {
          isConnected: socket.connected,
          userId: socket.userId,
          role: socket.role,
        });
      });

      socket.on("disconnect", async () => {
        if (socket.userId && socket.role) {
          this.connectedUsers.delete(socket.userId);
          await this.notifyUserStatus(socket.userId, socket.role, false);
          console.log(`User disconnected: userId=${socket.userId}, role=${socket.role}, socketId=${socket.id}`);
        }
      });
    });
  }

  private async notifyUserStatus(userId: string, role: string, isOnline: boolean): Promise<void> {
    try {
      if (role === ROLES.USER) {
        const client = await this._clientRepository.findById(userId);
        if (client?.selectedTrainerId) {
          const trainerSocketId = this.connectedUsers.get(client.selectedTrainerId)?.socketId;
          if (trainerSocketId) {
            this.io.to(trainerSocketId).emit("userStatus", {
              userId,
              status: isOnline ? "online" : "offline",
              lastSeen: isOnline ? undefined : new Date().toISOString(),
            });
          }
        }
      } else if (role === ROLES.TRAINER) {
        const { items: clients } = await this._clientRepository.find(
          { selectedTrainerId: userId, selectStatus: TrainerSelectionStatus.ACCEPTED },
          0,
          100
        );
        for (const client of clients) {
          const clientSocketId = this.connectedUsers.get(client.clientId)?.socketId;
          if (clientSocketId) {
            this.io.to(clientSocketId).emit("userStatus", {
              userId,
              status: isOnline ? "online" : "offline",
              lastSeen: isOnline ? undefined : new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error notifying user status:", error);
    }
  }

  private async validateRelationship(senderId: string, receiverId: string, senderRole: string): Promise<boolean> {
    try {
      if (senderRole === ROLES.USER) {
        const client = await this._clientRepository.findById(senderId);
        return (
          !!client &&
          client.isPremium==true &&
          client.selectStatus === TrainerSelectionStatus.ACCEPTED &&
          client.selectedTrainerId === receiverId
        );
      } else if (senderRole === ROLES.TRAINER) {
        const client = await this._clientRepository.findById(receiverId);
        return (
          !!client &&
          client.isPremium==true &&
          client.selectStatus === TrainerSelectionStatus.ACCEPTED &&
          client.selectedTrainerId === senderId
        );
      }
      return false;
    } catch (error) {
      console.error("Error validating relationship:", error);
      return false;
    }
  }

  private async logTrainerClientConnection(userId: string, role: string): Promise<void> {
    try {
      if (role === ROLES.USER) {
        const client = await this._clientRepository.findById(userId);
        if (client?.selectedTrainerId) {
          const trainer = this.connectedUsers.get(client.selectedTrainerId);
          if (trainer) {
            console.log(
              `Trainer and Client connected: clientId=${userId}, trainerId=${client.selectedTrainerId}`
            );
          }
        }
      } else if (role === ROLES.TRAINER) {
        const { items: clients } = await this._clientRepository.find(
          { selectedTrainerId: userId, selectStatus: TrainerSelectionStatus.ACCEPTED },
          0,
          100
        );
        for (const client of clients) {
          const clientConnected = this.connectedUsers.get(client.clientId);
          if (clientConnected) {
            console.log(
              `Trainer and Client connected: clientId=${client.clientId}, trainerId=${userId}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error checking trainer-client connection:", error);
    }
  }

  private getReceiverIdFromChatId(chatId: string, senderId: string): string | null {
    const [id1, id2] = chatId.split("_");
    return id1 === senderId ? id2 : id1 === id2 ? null : id1;
  }

  private mapToFrontendMessage(message: IMessageEntity): any {
    return {
      id: message.id,
      senderId: message.senderId,
      text: message.content,
      timestamp: message.createdAt,
      read: message.status === MessageStatus.READ,
      media: message.mediaUrl
        ? {
            type: message.mediaType,
            url: message.mediaUrl,
          }
        : undefined,
      replyToId: message.replyToId,
      reactions: message.reactions || [],
    };
  }

  getSocketId(userId: string): string | null {
    const user = this.connectedUsers.get(userId);
    return user ? user.socketId : null;
  }

  getIO(): Server {
    return this.io;
  }

  getConnectedUser(userId: string): { socketId: string; role: string } | undefined {
    return this.connectedUsers.get(userId);
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}