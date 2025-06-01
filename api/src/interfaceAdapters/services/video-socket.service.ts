// D:\StriveX\api\src\interfaceAdapters\services\video-socket.service.ts
import { Server, Socket } from "socket.io";
import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { IStartVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/startvideo-usecase.interface";
import { IJoinVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/join-video-usecase.interface";
import { IEndVideoCallUseCase } from "@/entities/useCaseInterfaces/videocall/end-video-usecase.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { ITokenService } from "@/entities/services/token-service.interface";
import { RoleType, VideoCallStatus } from "@/shared/constants";
import { Server as HttpServer } from "http";
import { JwtPayload } from "jsonwebtoken";

interface UserSocket extends Socket {
  userId?: string;
  role?: RoleType;
}

@injectable()
export class VideoSocketService {
  private io: Server;
  private connectedUsers: Map<string, { socketId: string; userId: string; role: RoleType }> = new Map();

  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("IStartVideoCallUseCase") private startVideoCallUseCase: IStartVideoCallUseCase,
    @inject("IJoinVideoCallUseCase") private joinVideoCallUseCase: IJoinVideoCallUseCase,
    @inject("IEndVideoCallUseCase") private endVideoCallUseCase: IEndVideoCallUseCase,
    @inject("NotificationService") private notificationService: NotificationService,
    @inject("ITokenService") private jwtService: ITokenService
  ) {
    this.io = new Server({
      cors: {
        origin: process.env.CORS_ALLOWED_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 300000, 
      pingInterval: 10000, 
      path: "/socket.io/video",
      transports: ["websocket", "polling"],
      allowEIO3: true,
      connectTimeout: 30000,
      maxHttpBufferSize: 1e8, 
    });
  }

  private isValidRole(role: string): role is RoleType {
    return ["client", "trainer", "admin"].includes(role);
  }

  initialize(server: HttpServer): void {
    this.io.attach(server);

    this.io.on("connection", (socket: UserSocket) => {
      socket.on("register", async ({ userId, role, token }: { userId: string; role: RoleType; token: string }) => {
        console.log(token, userId, role, "register");
        if (!userId || !this.isValidRole(role) || !token) {
          socket.emit("error", { message: "Invalid user ID, role, or token" });
          socket.disconnect();
          return;
        }

        try {
          const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
          console.log(payload, "payload");
          if (!payload || payload.id !== userId || payload.role !== role) {
            socket.emit("error", { message: "Invalid or expired token" });
            socket.disconnect();
            return;
          }

          let userExists = false;
          let standardizedUserId = userId;

          if (role === "client") {
            const client = await this.clientRepository.findByClientId(userId) ||
              await this.clientRepository.findById(userId);
            if (client && client.id) {
              userExists = true;
              standardizedUserId = client.id.toString();
            }
          } else if (role === "trainer") {
            const trainer = await this.trainerRepository.findById(userId);
            if (trainer && trainer.id) {
              userExists = true;
              standardizedUserId = trainer.id.toString();
            }
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
            userId: standardizedUserId,
            role,
          });

          socket.emit("registerSuccess", { userId: standardizedUserId });
        } catch (error) {
          socket.emit("error", { message: "Error during authentication" });
          socket.disconnect();
        }
      });

      socket.on("startVideoCall", async ({ slotId, userId, role }) => {
        if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
          socket.emit("error", { message: "User not authenticated or role mismatch" });
          return;
        }

        try {
          const slot = await this.startVideoCallUseCase.execute(slotId, userId, role);
          const receiverId = role === "trainer" ? slot.clientId : slot.trainerId.toString();

          if (!receiverId) {
            socket.emit("error", { message: "No receiver found for the slot" });
            return;
          }

          const receiverSocketId = this.getSocketId(receiverId);
          socket.emit("videoCallStarted", {
            slotId,
            roomName: slot.videoCallRoomName,
            videoCallStatus: slot.videoCallStatus,
          });

          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("videoCallStarted", {
              slotId,
              roomName: slot.videoCallRoomName,
              videoCallStatus: slot.videoCallStatus,
            });

            const sender = role === "client"
              ? await this.clientRepository.findByClientId(userId)
              : await this.trainerRepository.findById(userId);
            const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Someone";

            await this.notificationService.sendToUser(
              receiverId,
              "Video Call Started",
              `${senderName} has started a video call for slot ${slotId}.`,
              "INFO"
            );
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to start video call: ${(error as Error).message}`,
          });
        }
      });

      socket.on("joinVideoCall", async ({ slotId, userId, role }) => {
        if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
          socket.emit("error", { message: "User not authenticated or role mismatch" });
          return;
        }

        try {
          const slot = await this.joinVideoCallUseCase.execute(slotId, userId, role);
          socket.emit("videoCallJoined", {
            slotId,
            roomName: slot.videoCallRoomName,
            videoCallStatus: slot.videoCallStatus,
          });
        } catch (error) {
          socket.emit("error", {
            message: `Failed to join video call: ${(error as Error).message}`,
          });
        }
      });

      socket.on("endVideoCall", async ({ slotId, userId, role }) => {
        if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
          socket.emit("error", { message: "User not authenticated or role mismatch" });
          return;
        }

        try {
          const slot = await this.endVideoCallUseCase.execute(slotId, userId, role);
          const receiverId = role === "trainer" ? slot.clientId : slot.trainerId.toString();

          if (!receiverId) {
            socket.emit("error", { message: "No receiver found for the slot" });
            return;
          }

          const receiverSocketId = this.getSocketId(receiverId);
          socket.emit("videoCallEnded", {
            slotId,
            videoCallStatus: slot.videoCallStatus,
          });

          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("videoCallEnded", {
              slotId,
              videoCallStatus: slot.videoCallStatus,
            });

            const sender = role === "client"
              ? await this.clientRepository.findByClientId(userId)
              : await this.trainerRepository.findById(userId);
            const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Someone";

            await this.notificationService.sendToUser(
              receiverId,
              "Video Call Ended",
              `${senderName} has ended the video call for slot ${slotId}.`,
              "INFO"
            );
          }
        } catch (error) {
          socket.emit("error", {
            message: `Failed to end video call: ${(error as Error).message}`,
          });
        }
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  getSocketId(userId: string): string | null {
    const userInfo = this.connectedUsers.get(userId);
    return userInfo ? userInfo.socketId : null;
  }

  getIO(): Server {
    return this.io;
  }
}