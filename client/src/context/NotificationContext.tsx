import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Toaster, toast } from "react-hot-toast";
import { INotification } from "../types/notification";
import { initializeFCM } from "./fcmService";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notification/notificationService";
import { UserRole } from "../types/UserRole";
import { useSocket } from "./socketContext";
import { NotificationToast } from "@/components/Notification/NotificationToast";
interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  fetchNotifications: (page: number, limit: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  isLoading: boolean;
  addTemporaryNotification: (tempNotification: Omit<INotification, "id" | "createdAt">) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userId: string | null;
  role: string | null;
}> = ({ children, userId, role }) => {
  console.log(role, "noti role");
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastConnected, setLastConnected] = useState<string>(new Date().toISOString());

 const showToast = useCallback(
  (notification: INotification) => {
    toast(
      <NotificationToast
        notification={notification}
        onMarkAsRead={markAsRead}
      />,
      {
        id: notification.id,
        duration: 5000,
        position: "top-right",
        style: {
          background: "transparent", 
          border: "none", 
          boxShadow: "none", 
          padding: "0px",
          borderRadius: "0px",
          margin: "0px", 
        },
        className: "cursor-pointer",
      }
    );
  },
  []
);

  const fetchNotifications = useCallback(
    async (page: number, limit: number) => {
      if (!userId || !role) {
        console.warn("[DEBUG] Client: fetchNotifications skipped: Invalid userId or role", {
          userId,
          role,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      setIsLoading(true);
      try {
        console.log("[DEBUG] Client: Fetching notifications", {
          page,
          limit,
          userId,
          timestamp: new Date().toISOString(),
        });
        const fetchedNotifications = await getUserNotifications(role as UserRole, page, limit);
        console.log("[DEBUG] Client: Fetched notifications", {
          count: fetchedNotifications.length,
          notifications: fetchedNotifications.map((n: INotification) => ({ id: n.id, title: n.title })),
          timestamp: new Date().toISOString(),
        });
        setNotifications((prev) => {
          const updatedNotifications = page === 1 ? [] : [...prev];
          fetchedNotifications.forEach((newNotif: INotification) => {
            const existingIndex = updatedNotifications.findIndex((n) => n.id === newNotif.id);
            if (existingIndex >= 0) {
              updatedNotifications[existingIndex] = newNotif;
            } else {
              updatedNotifications.push(newNotif);
            }
          });
          const sortedNotifications = updatedNotifications.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return sortedNotifications;
        });
        setUnreadCount(fetchedNotifications.filter((n: INotification) => !n.isRead).length);
        if (socket && isConnected) {
          socket.emit("updateNotifications", { notifications: fetchedNotifications });
          console.log("[DEBUG] Client: Emitted updateNotifications", {
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("[DEBUG] Client: Failed to fetch notifications", {
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, role, socket, isConnected]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId || !role) {
        console.warn("[DEBUG] Client: markAsRead skipped: Invalid userId or role", {
          userId,
          role,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      try {
        console.log("[DEBUG] Client: Marking notification as read", {
          notificationId,
          timestamp: new Date().toISOString(),
        });
        await markNotificationAsRead(role as UserRole, notificationId);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => {
          const newCount = Math.max(prev - 1, 0);
          console.log("[DEBUG] Client: Decrementing unread count", {
            newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        if (socket && isConnected) {
          socket.emit("markNotificationAsRead", { notificationId });
          console.log("[DEBUG] Client: Emitted markNotificationAsRead", {
            notificationId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("[DEBUG] Client: Failed to mark notification as read", {
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [userId, role, socket, isConnected]
  );

  const addTemporaryNotification = useCallback(
    (tempNotification: Omit<INotification, "id" | "createdAt">) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const notification: INotification = {
        ...tempNotification,
        id: tempId,
        createdAt: new Date(),
        isTemporary: true,
      };
      console.log("[DEBUG] Client: Adding temporary notification", {
        tempId,
        title: notification.title,
        timestamp: new Date().toISOString(),
      });
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          console.log("[DEBUG] Client: Incrementing unread count for temporary notification", {
            newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        showToast(notification);
      }
      return tempId;
    },
    [showToast]
  );

  useEffect(() => {
    if (!userId || !role) {
      console.warn("[DEBUG] Client: Notification setup skipped: Invalid userId or role", {
        userId,
        role,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    initializeFCM(role as UserRole, userId, (notification: INotification) => {
      console.log("[DEBUG] Client: FCM notification received", {
        id: notification.id,
        title: notification.title,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        userId,
        timestamp: new Date().toISOString(),
      });
      setNotifications((prev) => {
        const tempIndex = prev.findIndex((n) => n.isTemporary && n.id === notification.id);
        if (tempIndex >= 0) {
          console.log("[DEBUG] Client: Replacing temporary notification", {
            tempId: prev[tempIndex].id,
            newId: notification.id,
            timestamp: new Date().toISOString(),
          });
          const updated = [...prev];
          updated[tempIndex] = { ...notification, isTemporary: false };
          return updated;
        }
        if (prev.some((n) => n.id === notification.id)) {
          console.log("[DEBUG] Client: Duplicate FCM notification ignored", {
            id: notification.id,
            timestamp: new Date().toISOString(),
          });
          return prev;
        }
        console.log("[DEBUG] Client: Adding FCM notification", {
          id: notification.id,
          timestamp: new Date().toISOString(),
        });
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          console.log("[DEBUG] Client: Incrementing unread count for FCM", {
            newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        showToast(notification);
      }
      if (socket && isConnected) {
        socket.emit("updateNotifications", { notifications: [notification] });
        console.log("[DEBUG] Client: Emitted updateNotifications for FCM", {
          timestamp: new Date().toISOString(),
        });
      }
    });

    fetchNotifications(1, 10);

    if (socket && isConnected) {
      socket.on("notification", (notification: INotification) => {
        console.log("[DEBUG] Client: Notification received via socket", {
          id: notification.id,
          title: notification.title,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          userId,
          timestamp: new Date().toISOString(),
        });
        setNotifications((prev) => {
          const tempIndex = prev.findIndex((n) => n.isTemporary && n.id === notification.id);
          if (tempIndex >= 0) {
            console.log("[DEBUG] Client: Replacing temporary notification", {
              tempId: prev[tempIndex].id,
              newId: notification.id,
              timestamp: new Date().toISOString(),
            });
            const updated = [...prev];
            updated[tempIndex] = { ...notification, isTemporary: false };
            return updated;
          }
          if (prev.some((n) => n.id === notification.id)) {
            console.log("[DEBUG] Client: Duplicate notification ignored", {
              id: notification.id,
              timestamp: new Date().toISOString(),
            });
            return prev;
          }
          console.log("[DEBUG] Client: Adding new notification", {
            id: notification.id,
            timestamp: new Date().toISOString(),
          });
          return [notification, ...prev];
        });
        if (!notification.isRead) {
          setUnreadCount((prev) => {
            const newCount = prev + 1;
            console.log("[DEBUG] Client: Incrementing unread count", {
              newCount,
              timestamp: new Date().toISOString(),
            });
            return newCount;
          });
          showToast(notification);
        }
      });

      socket.on("missedNotifications", (missedNotifications: INotification[]) => {
        console.log("[DEBUG] Client: Received missed notifications", {
          count: missedNotifications.length,
          notifications: missedNotifications.map((n) => ({ id: n.id, title: n.title })),
          timestamp: new Date().toISOString(),
        });
        setNotifications((prev) => {
          const newNotifications = missedNotifications.filter((n) => !prev.some((existing) => existing.id === n.id));
          const updated = [...newNotifications, ...prev].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          console.log("[DEBUG] Client: Missed notifications added", {
            newCount: newNotifications.length,
            totalCount: updated.length,
            timestamp: new Date().toISOString(),
          });
          return updated;
        });
        const newUnreadNotifications = missedNotifications.filter((n) => !n.isRead);
        setUnreadCount((prev) => {
          const newUnread = newUnreadNotifications.length;
          const newCount = prev + newUnread;
          console.log("[DEBUG] Client: Updating unread count for missed notifications", {
            newUnread,
            newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        newUnreadNotifications.forEach((notification) => showToast(notification));
      });

      socket.on("reconnect", (attempt: number) => {
        console.log("[DEBUG] Client: Socket reconnected in NotificationContext", {
          attempt,
          userId,
          timestamp: new Date().toISOString(),
        });
        socket.emit("joinNotificationsRoom", { userId });
        socket.emit("fetchMissedNotifications", { userId, lastConnected });
      });

      socket.on("error", (err: any) => {
        console.error("[DEBUG] Client: Socket error in NotificationContext", {
          error: err.message || "Unknown error",
          timestamp: new Date().toISOString(),
        });
        fetchNotifications(1, 10);
      });
    }

    // Update lastConnected on connection
    if (isConnected) {
      setLastConnected(new Date().toISOString());
    }

    return () => {
      socket?.off("notification");
      socket?.off("missedNotifications");
      socket?.off("reconnect");
      socket?.off("error");
      console.log("[DEBUG] Client: Cleaning up NotificationContext", {
        timestamp: new Date().toISOString(),
      });
    };
  }, [userId, role, socket, isConnected, fetchNotifications, showToast]);

  useEffect(() => {
    console.log("[DEBUG] Client: Notifications state updated", {
      count: notifications.length,
      unreadCount,
      firstNotification: notifications[0] || null,
      timestamp: new Date().toISOString(),
    });
  }, [notifications, unreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        isLoading,
        addTemporaryNotification,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};