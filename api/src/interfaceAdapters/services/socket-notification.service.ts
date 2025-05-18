import { injectable, inject } from "tsyringe";
import { INotificationSocketService } from "@/entities/services/socket-service.interface";
import { INotificationEntity } from "@/entities/models/notification.entity";
import { SocketService } from "@/interfaceAdapters/services/socket.service";


@injectable()
export class SocketNotificationService implements INotificationSocketService {
  constructor(@inject("SocketService") private socketService: SocketService) {}
  emitNotification(userId: string, notification: INotificationEntity): void {
    const socketId = this.socketService.getSocketId(userId);
    if (socketId) {
      this.socketService.getIO().to(socketId).emit("notification", notification);
    }
  }
}