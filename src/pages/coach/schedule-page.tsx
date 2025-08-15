import React, { useEffect, useMemo, useState } from "react";
import { Card, Spinner, Table } from "react-bootstrap";
import Header from "../../components/Header";
import axiosPublic from "../../utils/axios/axiosPublic";

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

interface Slot {
    time: string;
    available: boolean;
}

interface Schedule {
    _id: string;
    date: string;
    isHoliday: boolean;
    holidayReason?: string;
    slots?: Slot[];
}

const CoachSchedulePage: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const userInfo = useMemo(() => (token ? decodeJwt(token) : null), [token]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!userInfo || userInfo.role !== "coach") {
                setLoading(false);
                return;
            }

            const today = new Date();
            const startDate = today.toISOString();
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30).toISOString();

            try {
                const res = await axiosPublic.get(
                    `/schedules/coach/${userInfo.sub}?startDate=${startDate}&endDate=${endDate}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setSchedules(res.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setSchedules([]);
                } else {
                    console.error("Failed to fetch schedule:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [userInfo, token]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!schedules.length) {
        return (
            <div className="text-center mt-5">
                <h5>No schedule found for the next 30 days.</h5>
            </div>
        );
    }

    return (
        <div className="p-4">
            <Header hideBrowseLinks />
            <Card className="p-3">
                <h4>My Schedule (Next 30 Days)</h4>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Slots</th>
                            <th>Holiday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((s) => (
                            <tr key={s._id}>
                                <td>{new Date(s.date).toLocaleDateString()}</td>
                                <td>
                                    {s.isHoliday
                                        ? "-"
                                        : s.slots?.map((slot) =>
                                              slot.available ? slot.time : `${slot.time} (Booked)`
                                          ).join(", ")}
                                </td>
                                <td>{s.isHoliday ? s.holidayReason || "Holiday" : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default CoachSchedulePage;
