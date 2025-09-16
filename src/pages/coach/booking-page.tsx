import React, { useEffect, useMemo, useState } from "react";
import axiosPublic from "../../utils/axios/axiosPublic";
import { Card, Row, Col, Spinner, Table, Badge, Button } from "react-bootstrap";
import Header from "../../components/Header";

type JwtPayload = { sub: string; email: string; role: string; exp: number };

const decodeJwt = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

interface Booking {
    _id: string;
    type: string;
    slot: string;
    status: string;
    coachStatus: "pending" | "accepted" | "declined";
    totalPrice: number;
    user?: { fullName: string; email: string };
}

const BookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const userInfo = useMemo(() => (token ? decodeJwt(token) : null), [token]);

    const fetchBookings = async () => {
        if (!userInfo || userInfo.role !== "coach") {
            setLoading(false);
            return;
        }
        try {
            const res = await axiosPublic.get(`/bookings/coach/${userInfo.sub}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching coach bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [userInfo, token]);

    const handleCoachStatus = async (bookingId: string, status: "accepted" | "declined") => {
        if (!userInfo) return;
        try {
            await axiosPublic.patch(`/bookings/${bookingId}/coach-status`, {
                coachId: userInfo.sub,
                status,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state after success
            setBookings((prev) =>
                prev.map((b) => b._id === bookingId ? { ...b, coachStatus: status } : b)
            );
        } catch (err) {
            console.error("Failed to update coach status:", err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!bookings.length) {
        return (
            <div className="text-center mt-5">
                <h5>No bookings found for this coach.</h5>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Header hideBrowseLinks />
            <Card className="p-3">
                <h4>My Bookings</h4>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Slot</th>
                            <th>Status</th>
                            <th>Coach Status</th>
                            <th>Total Price</th>
                            <th>User</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id}>
                                <td>{b.type}</td>
                                <td>{b.slot}</td>
                                <td>{b.status}</td>
                                <td>
                                    <Badge
                                        bg={
                                            b.coachStatus === "accepted"
                                                ? "success"
                                                : b.coachStatus === "pending"
                                                ? "warning"
                                                : "danger"
                                        }
                                    >
                                        {b.coachStatus.charAt(0).toUpperCase() + b.coachStatus.slice(1)}
                                    </Badge>
                                </td>
                                <td>{b.totalPrice.toLocaleString()}₫</td>
                                <td>{b.user?.fullName || "N/A"}</td>
                                <td>
                                    {b.coachStatus === "pending" && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                className="me-1"
                                                onClick={() => handleCoachStatus(b._id, "accepted")}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleCoachStatus(b._id, "declined")}
                                            >
                                                Decline
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default BookingsPage;
