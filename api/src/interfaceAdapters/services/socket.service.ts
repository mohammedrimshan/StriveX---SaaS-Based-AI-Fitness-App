import { Server, Socket } from "socket.io";
import { inject, injectable } from "tsyringe";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IMessageEntity } from "@/entities/models/message.entity";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { IPostEntity } from "@/entities/models/post.entity";

import {
  WORKOUT_TYPES,
  WorkoutType,
  MessageStatus,
  RoleType,
  TrainerSelectionStatus,
} from "@/shared/constants";
import { v4 as uuidv4 } from "uuid";
import { Server as HttpServer } from "http";
import { ILikePostUseCase } from "@/entities/useCaseInterfaces/community/like-post-usecase.interface";
import { FrontendMessage,FrontendPost,UserSocket } from "@/entities/models/socket.entity";
@injectable()
export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, { socketId: string; role: RoleType }> =
    new Map();
  private idMapping: Map<string, string> = new Map();

  constructor(
    @inject("IMessageRepository")
    private _messageRepository: IMessageRepository,
    @inject("ICommentRepository")
    private _commentRepository: ICommentRepository,
    @inject("IPostRepository") private _postRepository: IPostRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("ILikePostUseCase") private _likePostUseCase: ILikePostUseCase
  ) {
    this.io = new Server({
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
  }

  private isValidRole(role: string): role is RoleType {
    return ["client", "trainer", "admin"].includes(role);
  }

  initialize(server: HttpServer): void {
    this.io.attach(server);

    this.io.on("connection", (socket: UserSocket) => {
      socket.on("reconnect", async () => {
        if (socket.userId && socket.role) {
          socket.join("community");
        }
      });

      socket.on(
        "register",
        async ({ userId, role }: { userId: string; role: RoleType }) => {
          if (!userId || !this.isValidRole(role)) {
            socket.emit("error", { message: "Invalid user ID or role" });
            socket.disconnect();
            return;
          }

          let userExists = false;
          let standardizedUserId = userId;

          try {
            if (role === "client") {
              const client =
                (await this._clientRepository.findById(userId)) ||
                (await this._clientRepository.findByClientId(userId));
              if (client && client.id) {
                userExists = true;
                standardizedUserId = client.id.toString();

                if (client.id !== userId) {
                  this.idMapping.set(client.id.toString(), userId);
                }

                if (client.clientId && client.clientId !== userId) {
                  this.idMapping.set(client.clientId, userId);
                }

                if (userId.startsWith("striveX-client-")) {
                  const mongoId = client.id.toString();
                  this.idMapping.set(mongoId, userId);
                }

                await this._clientRepository.findByIdAndUpdate(client.id, {
                  isOnline: true,
                });
              }
            } else if (role === "trainer") {
              const trainer = await this._trainerRepository.findById(userId);
              if (trainer && trainer.id) {
                userExists = true;
                standardizedUserId = trainer.id.toString();

                if (trainer.id !== userId) {
                  this.idMapping.set(trainer.id.toString(), userId);
                }

                if (trainer.clientId && trainer.clientId !== userId) {
                  this.idMapping.set(trainer.clientId, userId);
                }

                await this._trainerRepository.findByIdAndUpdate(trainer.id, {
                  isOnline: true,
                });
              }
            } else if (role === "admin") {
              userExists = true;
            }
          } catch (error) {
            socket.emit("error", { message: "Error during authentication" });
            socket.disconnect();
            return;
          }

          if (!userExists) {
            socket.emit("error", { message: "User not found in database" });
            socket.disconnect();
            return;
          }

          socket.userId = standardizedUserId;
          socket.role = role;

          this.connectedUsers.set(standardizedUserId, {
            socketId: socket.id,
            role,
          });

          await this.notifyUserStatus(standardizedUserId, role, true);
          this.logTrainerClientConnection(standardizedUserId, role);

          socket.join("community");
          socket.emit("joinCommunity", { userId });

          try {
            const posts = await this._postRepository.find(
              { isDeleted: false },
              0,
              100
            );
            const frontendPosts = posts.items.map((post) =>
              this.mapToFrontendPost(post)
            );
            socket.emit("posts", frontendPosts);
          } catch (error) {
            socket.emit("error", { message: "Failed to fetch initial posts" });
          }
        }
      );

      socket.on("joinCommunity", async ({ userId }: { userId: string }) => {
        if (!socket.userId || socket.userId !== userId) {
          socket.emit("error", { message: "Unauthorized to join community" });
          return;
        }
        socket.join("community");
        socket.emit("joinCommunity", { userId });
      });

      socket.on(
        "createPost",
        async (data: {
          senderId: string;
          textContent: string;
          media?: { type: "image" | "video"; url: string; name?: string };
          category: string;
          role: RoleType;
        }) => {
          if (!socket.userId || !socket.role) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          if (data.role !== socket.role || !this.isValidRole(data.role)) {
            socket.emit("error", { message: "Role mismatch or invalid role" });
            return;
          }

          try {
            const { senderId, textContent, media, category, role } = data;

            if (!textContent && !media) {
              socket.emit("error", { message: "Text or media is required" });
              return;
            }
            if (!category) {
              socket.emit("error", { message: "Category is required" });
              return;
            }
            if (!WORKOUT_TYPES.includes(category as WorkoutType)) {
              socket.emit("error", {
                message: `Category must be one of: ${WORKOUT_TYPES.join(", ")}`,
              });
              return;
            }

            const mediaUrl = media?.url;

            let author: {
              _id: string;
              firstName: string;
              lastName: string;
              email: string;
              profileImage?: string;
              isTrainer?: boolean;
            } | null = null;
            if (role === "client") {
              const client =
                (await this._clientRepository.findById(senderId)) ||
                (await this._clientRepository.findByClientId(senderId));
              if (client && client.id) {
                author = {
                  _id: client.id.toString(),
                  firstName: client.firstName || "Unknown",
                  lastName: client.lastName || "",
                  email: client.email || "",
                  profileImage: client.profileImage || undefined,
                };
              } else {
                socket.emit("error", {
                  message: "Client not found or invalid",
                });
                return;
              }
            } else if (role === "trainer") {
              const trainer = await this._trainerRepository.findById(senderId);
              if (trainer && trainer.id) {
                author = {
                  _id: trainer.id.toString(),
                  firstName: trainer.firstName || "Unknown",
                  lastName: trainer.lastName || "",
                  email: trainer.email || "",
                  profileImage: trainer.profileImage || undefined,
                  isTrainer: true,
                };
              } else {
                socket.emit("error", {
                  message: "Trainer not found or invalid",
                });
                return;
              }
            } else if (role === "admin") {
              author = {
                _id: senderId,
                firstName: "Admin",
                lastName: "",
                email: "admin@example.com",
                profileImage: undefined,
              };
            }

            if (!author) {
              socket.emit("error", {
                message: "Failed to fetch author details",
              });
              return;
            }

            const post: Partial<IPostEntity> = {
              id: uuidv4(),
              author,
              authorId: senderId,
              role,
              textContent: textContent || (mediaUrl ? mediaUrl : ""),
              category: category as WorkoutType,
              likes: [],
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              mediaUrl,
              reports: [],
            };

            const savedPost = await this._postRepository.save(post);
            const frontendPost = this.mapToFrontendPost(savedPost, author);
            this.io.to("community").emit("newPost", frontendPost);
          } catch (error) {
            socket.emit("error", {
              message: `Failed to create post: ${(error as Error).message}`,
            });
          }
        }
      );

      socket.on(
        "deletePost",
        async ({ postId, role }: { postId: string; role: RoleType }) => {
          if (!socket.userId || !socket.role) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          if (role !== socket.role || !this.isValidRole(role)) {
            socket.emit("error", { message: "Role mismatch or invalid role" });
            return;
          }

          try {
            const post = await this._postRepository.findById(postId);
            if (
              !post ||
              (post.authorId !== socket.userId && socket.role !== "admin")
            ) {
              socket.emit("error", {
                message: "Unauthorized or post not found",
              });
              return;
            }

            const updatedPost = await this._postRepository.delete(postId);
            if (!updatedPost) {
              socket.emit("error", { message: "Failed to delete post" });
              return;
            }

            this.io.to("community").emit("postDeleted", { postId });
          } catch (error) {
            socket.emit("error", {
              message: `Failed to delete post: ${(error as Error).message}`,
            });
          }
        }
      );

      socket.on(
        "likePost",
        async ({
          postId,
          userId,
          role,
        }: {
          postId: string;
          userId: string;
          role: RoleType;
        }) => {
          if (
            !socket.userId ||
            !socket.role ||
            socket.userId !== userId ||
            role !== socket.role
          ) {
            socket.emit("error", {
              message: "User not authenticated or role mismatch",
            });
            return;
          }

          try {
            const updatedPost = await this._likePostUseCase.execute(
              postId,
              userId
            );
            const clients = await this.io.in("community").allSockets();
            this.io.to("community").emit("postLiked", {
              postId,
              userId,
              likes: updatedPost.likes || [],
              hasLiked: updatedPost.likes.includes(userId),
            });
          } catch (error) {
            socket.emit("error", {
              message: `Failed to like post: ${(error as Error).message}`,
            });
          }
        }
      );

      socket.on(
        "sendCommunityMessage",
        async (data: {
          postId: string;
          senderId: string;
          text?: string;
          media?: { type: "image" | "video"; url: string; name?: string };
          role: RoleType;
          tempId?: string;
        }) => {
          if (!socket.userId || !socket.role) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          if (data.role !== socket.role || !this.isValidRole(data.role)) {
            socket.emit("error", { message: "Role mismatch or invalid role" });
            return;
          }

          try {
            const { postId, senderId, text, media, role, tempId } = data;

            if (!text && !media) {
              socket.emit("error", { message: "Text or media is required" });
              return;
            }

            const mediaUrl = media?.url;

            let author: {
              _id: string;
              firstName: string;
              lastName: string;
              email: string;
              profileImage?: string;
              isTrainer?: boolean;
            } | null = null;
            if (role === "client") {
              const client =
                (await this._clientRepository.findById(senderId)) ||
                (await this._clientRepository.findByClientId(senderId));
              if (client && client.id) {
                author = {
                  _id: client.id.toString(),
                  firstName: client.firstName || "Unknown",
                  lastName: client.lastName || "",
                  email: client.email || "",
                  profileImage: client.profileImage || undefined,
                };
              } else {
                socket.emit("error", {
                  message: "Client not found or invalid",
                });
                return;
              }
            } else if (role === "trainer") {
              const trainer = await this._trainerRepository.findById(senderId);
              if (trainer && trainer.id) {
                author = {
                  _id: trainer.id.toString(),
                  firstName: trainer.firstName || "Unknown",
                  lastName: trainer.lastName || "",
                  email: trainer.email || "",
                  profileImage: trainer.profileImage || undefined,
                  isTrainer: true,
                };
              } else {
                socket.emit("error", {
                  message: "Trainer not found or invalid",
                });
                return;
              }
            } else if (role === "admin") {
              author = {
                _id: senderId,
                firstName: "Admin",
                lastName: "",
                email: "admin@example.com",
                profileImage: undefined,
              };
            }

            const comment: Partial<ICommentEntity> = {
              id: uuidv4(),
              postId,
              authorId: senderId,
              role,
              textContent: text || (mediaUrl ? mediaUrl : ""),
              likes: [],
              isDeleted: false,
              reports: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              mediaUrl,
            };

            const savedComment = await this._commentRepository.save(comment);

            const frontendComment = {
              id: savedComment.id,
              tempId,
              postId: savedComment.postId,
              authorId: savedComment.authorId,
              author,
              role: savedComment.role,
              textContent: savedComment.textContent,
              createdAt: savedComment.createdAt.toISOString(),
              mediaUrl,
            };

            this.io
              .to("community")
              .emit("receiveCommunityMessage", frontendComment);
          } catch (error) {
            socket.emit("error", {
              message: `Failed to send community message: ${
                (error as Error).message
              }`,
            });
          }
        }
      );

      socket.on(
        "sendMessage",
        async (data: {
          senderId: string;
          receiverId: string;
          text?: string;
          media?: {
            type: "image" | "video" | "file";
            url: string;
            name?: string;
          };
          replyToId?: string;
          tempId?: string;
        }) => {
          if (!socket.userId || !socket.role) {
            socket.emit("error", { message: "User not authenticated" });
            return;
          }

          try {
            const { senderId, receiverId, text, media, replyToId, tempId } =
              data;

            const isValid = await this.validateRelationship(
              senderId,
              receiverId,
              socket.role
            );
            if (!isValid) {
              socket.emit("error", {
                message: "You can only message your connected trainer/client",
              });
              return;
            }

            const mediaUrl = media?.url;
            const mediaType = media?.type || null;

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
            socket.emit("messageSent", { ...frontendMessage, tempId });

            const receiverSocketId = this.getSocketId(receiverId);
            if (receiverSocketId) {
              this.io
                .to(receiverSocketId)
                .emit("receiveMessage", { ...frontendMessage, tempId });
            }
          } catch (error) {
            socket.emit("error", {
              message: `Failed to send message: ${(error as Error).message}`,
            });
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
            socket.emit("error", {
              message: "Unauthorized or message not found",
            });
            return;
          }

          await this._messageRepository.delete(messageId);
          socket.emit("messageDeleted", { messageId });

          const receiverSocketId = this.getSocketId(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("messageDeleted", { messageId });
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to delete message: ${(error as Error).message}`,
          });
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

          const updatedMessage = await this._messageRepository.update(
            messageId,
            {
              reactions: [
                ...(message.reactions || []),
                { userId: socket.userId, emoji },
              ],
            }
          );

          if (!updatedMessage) {
            socket.emit("error", { message: "Failed to add reaction" });
            return;
          }

          const frontendMessage = this.mapToFrontendMessage(updatedMessage);
          socket.emit("reactionAdded", frontendMessage);

          const receiverSocketId = this.getSocketId(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("reactionAdded", frontendMessage);
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to add reaction: ${(error as Error).message}`,
          });
        }
      });

      socket.on("removeReaction", async ({ messageId, emoji, receiverId }) => {
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

          const updatedReactions = (message.reactions || []).filter(
            (reaction) =>
              !(reaction.userId === socket.userId && reaction.emoji === emoji)
          );
          const updatedMessage = await this._messageRepository.update(
            messageId,
            { reactions: updatedReactions }
          );

          if (!updatedMessage) {
            socket.emit("error", { message: "Failed to remove reaction" });
            return;
          }

          const frontendMessage = this.mapToFrontendMessage(updatedMessage);
          socket.emit("reactionRemoved", frontendMessage);

          const receiverSocketId = this.getSocketId(receiverId);
          if (receiverSocketId) {
            this.io
              .to(receiverSocketId)
              .emit("reactionRemoved", frontendMessage);
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to remove reaction: ${(error as Error).message}`,
          });
        }
      });

      socket.on("typing", ({ chatId, userId }) => {
        if (!socket.userId) return;
        const receiverId = this.getReceiverIdFromChatId(chatId, userId);
        if (receiverId) {
          const receiverSocketId = this.getSocketId(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("typing", { chatId, userId });
          }
        }
      });

      socket.on("stopTyping", ({ chatId, userId }) => {
        if (!socket.userId) return;
        const receiverId = this.getReceiverIdFromChatId(chatId, userId);
        if (receiverId) {
          const receiverSocketId = this.getSocketId(receiverId);
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("stopTyping", { chatId, userId });
          }
        }
      });

      socket.on("markAsRead", async ({ senderId, receiverId }) => {
        if (!socket.userId || socket.userId !== receiverId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }
        try {
          await this._messageRepository.markMessagesAsRead(
            senderId,
            receiverId
          );
          socket.emit("messagesRead", { senderId, receiverId });

          const senderSocketId = this.getSocketId(senderId);
          if (senderSocketId) {
            this.io
              .to(senderSocketId)
              .emit("messagesRead", { senderId, receiverId });
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to mark messages as read: ${
              (error as Error).message
            }`,
          });
        }
      });

      socket.on("checkConnection", () => {
        socket.emit("connectionStatus", {
          isConnected: socket.connected,
          userId: socket.userId,
          role: socket.role,
        });
      });

      socket.on("disconnect", async (reason) => {
        if (socket.userId && socket.role) {
          try {
            if (socket.role === "client") {
              await this._clientRepository.findByIdAndUpdate(socket.userId, {
                isOnline: false,
              });
            } else if (socket.role === "trainer") {
              await this._trainerRepository.findByIdAndUpdate(socket.userId, {
                isOnline: false,
              });
            }
          } catch (error) {
          }

          this.connectedUsers.delete(socket.userId);
          await this.notifyUserStatus(socket.userId, socket.role, false);
          socket.leave("community");
        }
      });
    });
  }

  private async notifyUserStatus(
    userId: string,
    role: RoleType,
    isOnline: boolean
  ): Promise<void> {
    try {
      if (role === "client") {
        const client =
          (await this._clientRepository.findById(userId)) ||
          (await this._clientRepository.findByClientId(userId));
        if (client?.selectedTrainerId) {
          const trainerSocketId = this.getSocketId(client.selectedTrainerId);
          if (trainerSocketId) {
            this.io.to(trainerSocketId).emit("userStatus", {
              userId,
              status: isOnline ? "online" : "offline",
              lastSeen: isOnline ? undefined : new Date().toISOString(),
            });
          }
        }
      } else if (role === "trainer") {
        const { items: clients } = await this._clientRepository.find(
          {
            selectedTrainerId: userId,
            selectStatus: TrainerSelectionStatus.ACCEPTED,
          },
          0,
          100
        );

        for (const client of clients) {
          const clientId =
            client.clientId || (client.id ? client.id.toString() : null);
          if (clientId) {
            const clientSocketId = this.getSocketId(clientId);
            if (clientSocketId) {
              this.io.to(clientSocketId).emit("userStatus", {
                userId,
                status: isOnline ? "online" : "offline",
                lastSeen: isOnline ? undefined : new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (error) {
    }
  }

  private async validateRelationship(
    senderId: string,
    receiverId: string,
    senderRole: RoleType
  ): Promise<boolean> {
    try {
      if (senderRole === "client") {
        const client =
          (await this._clientRepository.findById(senderId)) ||
          (await this._clientRepository.findByClientId(senderId));
        return (
          !!client &&
          client.isPremium === true &&
          client.selectStatus === TrainerSelectionStatus.ACCEPTED &&
          client.selectedTrainerId === receiverId
        );
      } else if (senderRole === "trainer") {
        const client =
          (await this._clientRepository.findById(receiverId)) ||
          (await this._clientRepository.findByClientId(receiverId));
        return (
          !!client &&
          client.isPremium === true &&
          client.selectStatus === TrainerSelectionStatus.ACCEPTED &&
          client.selectedTrainerId === senderId
        );
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async logTrainerClientConnection(
    userId: string,
    role: RoleType
  ): Promise<void> {
    try {
      if (role === "client") {
        const client =
          (await this._clientRepository.findById(userId)) ||
          (await this._clientRepository.findByClientId(userId));
        if (
          client?.selectedTrainerId &&
          this.isUserConnected(client.selectedTrainerId)
        ) {
        }
      } else if (role === "trainer") {
        const { items: clients } = await this._clientRepository.find(
          {
            selectedTrainerId: userId,
            selectStatus: TrainerSelectionStatus.ACCEPTED,
          },
          0,
          100
        );
        for (const client of clients) {
          const clientId =
            client.clientId || (client.id ? client.id.toString() : null);
          if (clientId && this.isUserConnected(clientId)) {
          }
        }
      }
    } catch (error) {
    }
  }

  private getReceiverIdFromChatId(
    chatId: string,
    senderId: string
  ): string | null {
    const [id1, id2] = chatId.split("_");
    return id1 === senderId ? id2 : id1 === id2 ? null : id1;
  }

  private mapToFrontendMessage(message: IMessageEntity): FrontendMessage {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.content,
      status: message.status,
      timestamp: message.createdAt.toISOString(),
      media: message.mediaUrl
        ? { type: message.mediaType || "file", url: message.mediaUrl }
        : undefined,
      replyToId: message.replyToId,
      reactions: message.reactions || [],
      deleted: message.deleted || false,
      readAt:
        message.status === MessageStatus.READ
          ? message.updatedAt?.toISOString()
          : undefined,
    };
  }

  private mapToFrontendPost(
    post: IPostEntity,
    fallbackAuthor?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
      isTrainer?: boolean;
    } | null
  ): FrontendPost {
    if (!post.id) {
      throw new Error(
        `Post ID is undefined for post with authorId: ${post.authorId}`
      );
    }

    const category = WORKOUT_TYPES.includes(post.category as WorkoutType)
      ? (post.category as WorkoutType)
      : "General";

    return {
      id: post.id,
      author: post.author || fallbackAuthor || null,
      authorId: post.authorId,
      role: post.role,
      textContent: post.textContent,
      mediaUrl: post.mediaUrl,
      category,
      likes: post.likes,
      commentsCount: post.commentsCount || 0,
      createdAt: post.createdAt.toISOString(),
      isDeleted: post.isDeleted || false,
    };
  }

  getSocketId(userId: string): string | null {
    const userInfo = this.connectedUsers.get(userId);
    if (userInfo) {
      return userInfo.socketId;
    }

    const mappedId = this.idMapping.get(userId);
    if (mappedId) {
      const mappedUserInfo = this.connectedUsers.get(mappedId);
      if (mappedUserInfo) {
        return mappedUserInfo.socketId;
      }
    }

    for (const [key, value] of this.idMapping.entries()) {
      if (value === userId) {
        const reverseUserInfo = this.connectedUsers.get(key);
        if (reverseUserInfo) {
          return reverseUserInfo.socketId;
        }
      }
    }

    return null;
  }

  getIO(): Server {
    return this.io;
  }

  getConnectedUser(
    userId: string
  ): { socketId: string; role: RoleType } | undefined {
    const direct = this.connectedUsers.get(userId);
    if (direct) return direct;

    const mappedId = this.idMapping.get(userId);
    if (mappedId) {
      return this.connectedUsers.get(mappedId);
    }

    for (const [key, value] of this.idMapping.entries()) {
      if (value === userId) {
        return this.connectedUsers.get(key);
      }
    }

    return undefined;
  }

  isUserConnected(userId: string): boolean {
    if (this.connectedUsers.has(userId)) return true;

    const mappedId = this.idMapping.get(userId);
    if (mappedId && this.connectedUsers.has(mappedId)) return true;

    for (const [key, value] of this.idMapping.entries()) {
      if (value === userId && this.connectedUsers.has(key)) return true;
    }

    return false;
  }

  public async getUserRole(userId: string): Promise<RoleType | null> {
    const client = await this._clientRepository.findById(userId);
    if (client) return "client";
    const trainer = await this._trainerRepository.findById(userId);
    if (trainer) return "trainer";

    return "admin";
  }
}