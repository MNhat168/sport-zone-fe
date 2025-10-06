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
    const [editRate, setEditRate] = useState(false);
    const [rateForm, setRateForm] = useState<number>(profile?.coach?.hourlyRate || 0);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editCert, setEditCert] = useState(false);
    const [certForm, setCertForm] = useState(profile?.coach?.certification || "");
    const [editBio, setEditBio] = useState(false);
    const [bioForm, setBioForm] = useState(profile?.coach?.bio || "");
    const [editSports, setEditSports] = useState(false);
    const [sportsForm, setSportsForm] = useState<string[]>(profile?.coach?.sports || []);
    const [form, setForm] = useState<{ fullName: string; phone?: string; avatarUrl?: string }>({ fullName: "" });
    // With HttpOnly cookie auth, derive userId from server responses or a lightweight user cookie if present
    const userId = useMemo(() => {
        try {
            const match = typeof document !== "undefined" ? document.cookie.match(/user=([^;]+)/) : null;
            if (!match) return null;
            const userStr = decodeURIComponent(match[1]);
            const userObj = JSON.parse(userStr);
            return userObj?.id || userObj?._id || null;
        } catch { return null; }
    }, []);

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

                    <div className="d-flex align-items-center gap-2 mt-2">
                        <strong>Chứng chỉ:</strong>

                        {!editCert ? (
                            <>
                            <span>{profile.coach?.certification || "Chưa có"}</span>
                            <Button
                                size="sm"
                                onClick={() => {
                                setCertForm(profile.coach?.certification || "");
                                setEditCert(true);
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                            </>
                        ) : (
                            <>
                            <Form.Control
                                type="text"
                                value={certForm}
                                onChange={(e) => setCertForm(e.target.value)}
                                style={{ width: "200px" }}
                            />
                            <Button
                                size="sm"
                                variant="success"
                                onClick={async () => {
                                if (!userId) return;

                                try {
                                    const { data } = await axiosPublic.patch(
                                    `/profiles/${userId}/certification`,
                                    { certification: certForm }, // now matches backend
                                    // Cookie-based auth; no manual Authorization header
                                    );

                                    // If your API returns the updated coach profile object:
                                    setProfile((prev) =>
                                    prev ? { ...prev, coach: data } : null
                                    );

                                    setEditCert(false);
                                } catch (err: unknown) {
                                    if (axios.isAxiosError(err)) {
                                    console.error("Update failed:", err.response?.data || err);
                                    alert(err.response?.data?.message || "Cập nhật thất bại");
                                    } else {
                                    console.error(err);
                                    alert("Cập nhật thất bại");
                                    }
                                }
                                }}
                            >
                                Lưu
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => setEditCert(false)}
                            >
                                Hủy
                            </Button>
                            </>
                        )}
                    </div>


                    <div className="d-flex align-items-center gap-2 mt-2">
                        <strong>Môn thể thao:</strong>
                        {!editSports ? (
                            <>
                                <span>{profile.coach?.sports?.join(", ") || "Chưa có"}</span>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setSportsForm(profile.coach?.sports || []);
                                        setEditSports(true);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                            </>
                        ) : (
                            <>
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập các môn, phân cách bằng dấu phẩy"
                                    value={sportsForm.join(", ")}
                                    onChange={(e) => setSportsForm(e.target.value.split(",").map(s => s.trim()))}
                                    style={{ width: "300px" }}
                                />
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={async () => {
                                        if (!userId) return;
                                        try {
                                            const { data } = await axiosPublic.patch(
                                                `/profiles/${userId}/sports`,
                                                { sports: sportsForm },
                                                // Cookie-based auth; no manual Authorization header
                                            );
                                            setProfile((prev) => prev ? { ...prev, coach: data } : null);
                                            setEditSports(false);
                                        } catch (err) {
                                            console.error("Update failed:", err);
                                            alert("Cập nhật thất bại");
                                        }
                                    }}
                                >
                                    Lưu
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => setEditSports(false)}
                                >
                                    Hủy
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-2">
                        <strong>Giá mỗi giờ:</strong>
                        {!editRate ? (
                        <>
                            <span>{profile.coach.hourlyRate}₫</span>
                            <Button size="sm" onClick={() => { setRateForm(profile.coach?.hourlyRate || 0); setEditRate(true); }}>Chỉnh sửa</Button>
                        </>
                        ) : (
                        <>
                            <Form.Control
                            type="number"
                            value={rateForm}
                            onChange={(e) => setRateForm(Number(e.target.value))}
                            style={{ width: "120px" }}
                            />
                            <Button
                            size="sm"
                            variant="success"
                            onClick={async () => {
                                if (!userId) return;
                                try {
                                const res = await axiosPublic.patch(
                                    `/profiles/${userId}/hourly-rate`,
                                    { hourlyRate: rateForm },
                                    // Cookie-based auth; no manual Authorization header
                                );
                                setProfile(prev => prev ? { ...prev, coach: res.data } : null);
                                setEditRate(false);
                                } catch (err) {
                                console.error("Update failed:", err.response?.data || err);
                                alert("Cập nhật thất bại");
                                }
                            }}
                            >
                            Lưu
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => setEditRate(false)}>Hủy</Button>
                        </>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-2">
                        <strong>Giới thiệu:</strong>
                        {!editBio ? (
                            <>
                                <span>{profile.coach?.bio || "Chưa có"}</span>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setBioForm(profile.coach?.bio || "");
                                        setEditBio(true);
                                    }}
                                >
                                    Chỉnh sửa
                                </Button>
                            </>
                        ) : (
                            <>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={bioForm}
                                    onChange={(e) => setBioForm(e.target.value)}
                                    style={{ width: "300px" }}
                                />
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={async () => {
                                        if (!userId) return;
                                        try {
                                            const { data } = await axiosPublic.patch(
                                                `/profiles/${userId}/bio`,
                                                { bio: bioForm },
                                                // Cookie-based auth; no manual Authorization header
                                            );
                                            setProfile((prev) => prev ? { ...prev, coach: data } : null);
                                            setEditBio(false);
                                        } catch (err) {
                                            console.error("Update failed:", err);
                                            alert("Cập nhật thất bại");
                                        }
                                    }}
                                >
                                    Lưu
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => setEditBio(false)}
                                >
                                    Hủy
                                </Button>
                            </>
                        )}
                    </div>

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
