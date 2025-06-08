import { injectable, inject } from "tsyringe";
import { SocketService } from "./socket.service";
import { INotificationEntity } from "@/entities/models/notification.entity";

@injectable()
export class SocketNotificationService {
  constructor(
    @inject("SocketService") private readonly socketService: SocketService
  ) {}

  async emitNotification(
    userId: string,
    notification: INotificationEntity
  ): Promise<void> {
    if (!userId || !notification) {
      console.error(
        `[${new Date().toISOString()}] Invalid userId or notification`,
        { userId, notification }
      );
      return;
    }

    const notificationPayload = {
      ...notification,
      id:
        notification.id ??
        (typeof notification._id === "object" && "toString" in notification._id
           ? (notification._id as { toString(): string }).toString()
          : undefined) ??
        crypto.randomUUID(),
      createdAt:
        notification.createdAt instanceof Date
          ? notification.createdAt.toISOString()
          : notification.createdAt,
    };

    console.log(
      `[${new Date().toISOString()}] Emitting notification to user:${userId} and notifications:${userId}`,
      JSON.stringify(notificationPayload, null, 2)
    );
    const io = this.socketService.getIO();

    try {
      // Fetch sockets in the notifications room
      const sockets = await io.in(`notifications:${userId}`).fetchSockets();

      if (sockets.length === 0) {
        console.warn(
          `[${new Date().toISOString()}] No active sockets found for user ${userId}`
        );
      } else {
        sockets.forEach((socket) => {
          io.to(socket.id).emit("notification", notificationPayload); // Emit to individual socket IDs
        });
        console.log(
          `[${new Date().toISOString()}] Emitted to ${
            sockets.length
          } socket(s) for user:${userId}`
        );
      }

      // Also emit to rooms for backward compatibility
      io.to(`user:${userId}`)
        .to(`notifications:${userId}`)
        .emit("notification", notificationPayload);

      // Log sockets in both rooms
      const userRoomSockets = await io.in(`user:${userId}`).allSockets();
      console.log(
        `[${new Date().toISOString()}] Sockets in user:${userId} room: ${
          userRoomSockets.size
        }`,
        Array.from(userRoomSockets)
      );
      const notifRoomSockets = await io
        .in(`notifications:${userId}`)
        .allSockets();
      console.log(
        `[${new Date().toISOString()}] Sockets in notifications:${userId} room: ${
          notifRoomSockets.size
        }`,
        Array.from(notifRoomSockets)
      );

      if (userRoomSockets.size === 0 && notifRoomSockets.size === 0) {
        console.warn(
          `[${new Date().toISOString()}] No sockets in rooms for user:${userId}. Checking all sockets.`
        );
        const allSockets = await io.allSockets();
        console.log(
          `[${new Date().toISOString()}] Total connected sockets: ${
            allSockets.size
          }`,
          Array.from(allSockets)
        );
      }
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Error checking sockets for user:${userId}`,
        err
      );
    }
  }
}
