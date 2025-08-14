import React, { useEffect, useMemo, useState } from "react";
import axiosPublic from "../../utils/axios/axiosPublic";
import { Card, Row, Col, Button, Form, Spinner, Badge } from "react-bootstrap";
import Header from "../../components/Header";

type JwtPayload = { sub: string; email: string; role: string; exp: number };

const decodeJwt = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    isVerified: boolean;
    coach?: CoachProfile;
}

interface CoachProfile {
    certification?: string;
    sports?: string[];
    hourlyRate?: number;
    bio?: string;          
    rating?: number;        
    totalReviews?: number;  
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<{ fullName: string; phone?: string; avatarUrl?: string }>({ fullName: "" });
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const userId = useMemo(() => {
        if (!token) return null;
        const payload = decodeJwt(token);
        return payload?.sub || null;
    }, [token]);

    useEffect(() => {
    const fetchProfile = async () => {
        try {
            if (!userId) {
                setLoading(false);
                return;
            }

            const resUser = await axiosPublic.get(`/users/${userId}/profile`);
            const userProfileData = resUser.data;

            let coachProfileData = null;
            try {
                const resCoach = await axiosPublic.get(`/profiles/user/${userId}`);
                coachProfileData = resCoach.data;
            } catch (err) {
                console.warn("No coach profile found for this user.");
            }

        
            setProfile({
                ...userProfileData,
                coach: coachProfileData, 
            });
        } catch (err) {
            console.error("Lỗi lấy thông tin user:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();
}, [userId]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                Không tìm thấy thông tin người dùng.
            </div>
        );
    }

    return (
    <>
        <style>{`
            .profile-wrapper {
                position: relative;
                inset: 0;
                width: 100vw;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                overflow-y: auto;
            }

            .profile-card {
                width: 100%;
                max-width: 820px;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .avatar-lg {
                width: 96px;
                height: 96px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #fff;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
            }
        `}</style>

        <div className="profile-wrapper">
            {/* Header without Fields/Coaches links; bell still visible when logged in */}
            <Header hideBrowseLinks />
            <Card className="profile-card p-4">
                <Row className="align-items-center g-4">
                    <Col xs="auto">
                        <img className="avatar-lg" src={profile.avatarUrl || "/default-avatar.png"} alt={profile.fullName} />
                    </Col>
                    <Col>
                        {!editMode ? (
                            <>
                                <h3 className="mb-1">{profile.fullName}</h3>
                                <div className="text-muted">{profile.email}</div>
                                {profile.phone && <div className="text-muted">{profile.phone}</div>}
                            </>
                        ) : (
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                                    <Form.Control
                                        value={form.fullName}
                                        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                                    <Form.Control
                                        value={form.phone || ""}
                                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    />
                                </Col>
                                <Col md={12}>
                                    <Form.Label className="fw-semibold">Ảnh đại diện (URL)</Form.Label>
                                    <Form.Control
                                        value={form.avatarUrl || ""}
                                        onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                                    />
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
                <hr className="my-4" />
                <Row className="g-3">
                    <Col md={6}>
                        <div><strong>Vai trò:</strong> <span className="text-capitalize">{profile.role}</span></div>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <div>
                            <strong>Xác thực:</strong> {profile.isVerified ? (
                                <Badge bg="success" className="ms-1">Đã xác thực</Badge>
                            ) : (
                                <Badge bg="secondary" className="ms-1">Chưa xác thực</Badge>
                            )}
                        </div>
                    </Col>
                </Row>

                {profile.coach && (
                    <>
                    <hr className="my-4" />
                    <h5 className="mb-3">Thông tin Huấn luyện viên</h5>

                    {profile.coach.certification && (
                        <div><strong>Chứng chỉ:</strong> {profile.coach.certification}</div>
                    )}

                    {profile.coach.sports?.length ? (
                        <div><strong>Môn thể thao:</strong> {profile.coach.sports.join(", ")}</div>
                    ) : null}

                    {profile.coach.hourlyRate && (
                        <div><strong>Giá mỗi giờ:</strong> {profile.coach.hourlyRate}₫</div>
                    )}

                    {profile.coach.bio && (
                        <div><strong>Giới thiệu:</strong> {profile.coach.bio}</div>
                    )}

                    {typeof profile.coach.rating === "number" && (
                        <div><strong>Xếp hạng:</strong> {profile.coach.rating} / 5</div>
                    )}

                    {typeof profile.coach.totalReviews === "number" && (
                        <div><strong>Tổng lượt đánh giá:</strong> {profile.coach.totalReviews}</div>
                    )}
                </>
            )}


                <div className="d-flex justify-content-end gap-2 mt-4">
                    {!editMode ? (
                        <Button
                            variant="primary"
                            onClick={() => {
                                setForm({ fullName: profile.fullName, phone: profile.phone, avatarUrl: profile.avatarUrl });
                                setEditMode(true);
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setEditMode(false)}
                                disabled={saving}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="success"
                                onClick={async () => {
                                    if (!userId) return;
                                    setSaving(true);
                                    try {
                                        const res = await axiosPublic.patch(`/users/${userId}/profile`, {
                                            fullName: form.fullName,
                                            phone: form.phone,
                                            avatarUrl: form.avatarUrl,
                                        });
                                        setProfile(res.data);
                                        setEditMode(false);
                                    } catch {
                                        alert("Cập nhật thất bại");
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                disabled={saving || !form.fullName.trim()}
                            >
                                {saving ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    </>
);

};

export default ProfilePage;
