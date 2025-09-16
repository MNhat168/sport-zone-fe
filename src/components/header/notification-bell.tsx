"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { ScrollArea } from "../../components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import axiosInstance from "../../utils/axios/axiosPrivate";

interface Notification {
  id: string;
  content: string;
  created_at: string;
  isRead?: boolean;
  url: string;
}

interface NotificationBellProps {
  userId: string | null;
  variant?: "default" | "sidebar";
}

export function NotificationBell({
  userId,
  variant = "default",
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket(userId || "");

  console.log("📱 NotificationBell props:", { userId, variant });
  console.log("📱 Socket instance:", socket);
  //Fetch all notifications on mount
  useEffect(() => {
    if (!userId) {
      console.log("📱 No userId provided, skipping notification fetch");
      return;
    }

    console.log("📱 Fetching notifications for user:", userId);
    
    const fetchNotifications = async () => {
      try {
        const [notificationResponse, unreadResponse] = await Promise.all([
          axiosInstance.get(`/notification/history/${userId}`),
          axiosInstance.get(`/notification/user/${userId}/unread-count`)
        ]);
        
        setNotifications(notificationResponse.data.data || []);
        setUnreadCount(unreadResponse.data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [userId]);
  useEffect(() => {
    if (!socket) {
      console.log("📱 No socket available");
      return;
    }

    console.log("📱 Setting up notification listener for user:", userId);

    interface IncomingNotification {
      id?: string;
      _id?: string;
      content: string;
      created_at: string;
      url?: string;
    }

    const handleNotification = (data: IncomingNotification) => {
      console.log("📩 WebSocket Notification received:", data);
      console.log("📩 Data structure:", JSON.stringify(data, null, 2));

      const notificationId = data?.id || data?._id;
      if (!notificationId) {
        console.warn("Notification received without an id, skipping:", data);
        return;
      }

      const newNotification: Notification = {
        id: notificationId,
        content: data?.content || "Bạn có thông báo mới!",
        created_at: data?.created_at || new Date().toISOString(),
        url: data?.url || "/",
      };
      console.log("📩 Processed notification:", newNotification);

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        console.log("📩 Updated notifications:", updated);
        return updated;
      });

      setUnreadCount((prev) => {
        const newCount = prev + 1;
        console.log("📩 New unread count:", newCount);
        return newCount;
      });

      // Show toast notification
      toast(data?.content || "Bạn có thông báo mới!");
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, userId]);

  const handleMarkAsRead = async () => {
    if (!userId) return;
    
    try {
      // Mark all notifications as read
      await axiosInstance.patch(`/notification/user/${userId}/read-all`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        // Mark individual notification as read
        await axiosInstance.patch(`/notification/${notification.id}/read`);
        
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        // Decrease unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Navigate to the notification URL
    window.location.href = notification.url;
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: vi,
    });
  };

  console.log("Current Notifications:", notifications);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${
            variant === "sidebar"
              ? "text-primary-200 hover:text-white hover:bg-primary-700"
              : ""
          }`}
          title="Thông báo"
        >
          <Bell
            className={`h-5 w-5 ${
              variant === "sidebar" ? "text-primary-200" : ""
            }`}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="font-medium">Thông báo</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              className="text-xs"
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={notification.url}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }}
                  className={`flex flex-col border-b p-4 hover:bg-muted/50 cursor-pointer ${
                    notification.isRead ? "bg-white" : "bg-gray-100 hover:rounded-xl"
                  }`}
                >
                  <p className="text-sm">{notification.content}</p>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">
                Không có thông báo
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
