// D:\StriveX\client\src\context\NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { INotification } from "../types/notification";
import { initializeFCM } from "./fcmService";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notification/notificationService";
import { UserRole } from "../types/UserRole";
import { useSocket } from "./socketContext";

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  fetchNotifications: (page: number, limit: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userId: string | null;
  role: string | null;
}> = ({ children, userId, role }) => {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(
    async (page: number, limit: number) => {
      if (!userId || !role) {
        console.warn(
          "[DEBUG] Client: fetchNotifications skipped: Invalid userId or role",
          { userId, role }
        );
        return;
      }
      setIsLoading(true);
      try {
        console.log(
          "[DEBUG] Client: Fetching notifications, page:",
          page,
          "limit:",
          limit
        );
        const fetchedNotifications = await getUserNotifications(
          role as UserRole,
          page,
          limit,
        );
        console.log(
          "[DEBUG] Client: Fetched notifications:",
          fetchedNotifications
        );
        setNotifications((prev) => {
          const updatedNotifications = page === 1 ? [] : [...prev];
          fetchedNotifications.forEach((newNotif) => {
            const existingIndex = updatedNotifications.findIndex(
              (n) => n.id === newNotif.id
            );
            if (existingIndex >= 0) {
              updatedNotifications[existingIndex] = newNotif;
            } else {
              updatedNotifications.push(newNotif);
            }
          });
          return updatedNotifications;
        });
        setUnreadCount(fetchedNotifications.filter((n) => !n.isRead).length);
        if (socket && isConnected) {
          socket.emit("updateNotifications", {
            notifications: fetchedNotifications,
          });
          console.log("[DEBUG] Client: Emitted updateNotifications");
        }
      } catch (error) {
        console.error("[DEBUG] Client: Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, role, socket, isConnected]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId || !role) {
        console.warn(
          "[DEBUG] Client: markAsRead skipped: Invalid userId or role",
          { userId, role }
        );
        return;
      }
      try {
        await markNotificationAsRead(role as UserRole, notificationId);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
        console.log(
          "[DEBUG] Client: Successfully marked notification as read:",
          notificationId
        );
        if (socket && isConnected) {
          socket.emit("markNotificationAsRead", { notificationId });
        }
      } catch (error) {
        console.error(
          "[DEBUG] Client: Failed to mark notification as read:",
          error
        );
      }
    },
    [userId, role, socket, isConnected]
  );

  useEffect(() => {
    if (!userId || !role) {
      console.warn(
        "[DEBUG] Notification setup skipped: Invalid userId or role",
        { userId, role }
      );
      return;
    }

    initializeFCM(role as UserRole, userId, (notification: INotification) => {
      console.log("[DEBUG] Client: FCM notification received:", notification);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
      if (socket && isConnected) {
        socket.emit("updateNotifications", { notifications: [notification] });
      }
    });

    fetchNotifications(1, 10);

    const interval = setInterval(() => {
      if (!isConnected) {
        console.log("[DEBUG] Socket disconnected, polling notifications");
        fetchNotifications(1, 10);
      }
    }, 60000); // Poll every 60 seconds if disconnected

    if (socket && isConnected) {
      socket.on("notification", (notification: INotification) => {
        console.log(
          "[DEBUG] Client: Notification received via socket in NotificationContext:",
          notification
        );
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
        if (!notification.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("error", (err) => {
        console.error("[DEBUG] Socket error:", err);
        fetchNotifications(1, 10);
      });
    }

    return () => {
      socket?.off("notification");
      socket?.off("error");
      clearInterval(interval);
    };
  }, [userId, role, socket, isConnected, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};