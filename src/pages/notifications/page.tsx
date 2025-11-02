"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check } from "lucide-react";
import axiosPublic from "@/utils/axios/axiosPublic";
import { formatDistanceToNow, isValid, subHours } from "date-fns";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { PageWrapper } from "@/components/layouts/page-wrapper";
interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const storedUser = sessionStorage.getItem("user");
            if (!storedUser) return;

            const user = JSON.parse(storedUser);
            const userId = user?._id;
            if (!userId) return;

            try {
                const res = await axiosPublic.get(`/notifications/user/${userId}`);
                setNotifications(res.data?.data || []);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatNotificationTime = (createdAt?: string) => {
        if (!createdAt) return "Unknown time";

        let date = new Date(createdAt);
        if (!isValid(date)) return "Invalid date";

        date = subHours(date, 7);

        return formatDistanceToNow(date, { addSuffix: true });
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await axiosPublic.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await Promise.all(
                notifications
                    .filter((n) => !n.isRead)
                    .map((n) => axiosPublic.patch(`/notifications/${n._id}/read`))
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Error marking all as read:", err);
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading notifications...</p>
            </div>
        );
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <div className="p-6 max-w-3xl mx-auto">
                    <Card className="shadow-md">
                        <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
                                <Badge variant="outline">{notifications.length} total</Badge>
                            </div>

                            {notifications.some((n) => !n.isRead) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={markingAll}
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" />
                                    {markingAll ? "Marking..." : "Mark all as read"}
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-center py-6">No notifications found.</p>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`border p-4 rounded-lg flex justify-between items-start ${notif.isRead ? "bg-gray-50" : "bg-white"
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium">{notif.title}</p>
                                            <p className="text-sm text-gray-600">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatNotificationTime(notif.createdAt)}
                                            </p>
                                        </div>

                                        {!notif.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notif._id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Mark as read
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        </>
    );
}

