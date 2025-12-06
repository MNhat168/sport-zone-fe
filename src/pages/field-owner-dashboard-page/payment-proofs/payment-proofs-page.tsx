"use client";

import { useState, useEffect } from "react";
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Booking {
    _id: string;
    id?: string;
    user: {
        fullName: string;
        email: string;
        phone?: string;
    };
    field: {
        name: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    bookingAmount: number;
    platformFee: number;
    totalPrice?: number;
    transaction?: {
        _id: string;
        paymentProofImageUrl: string;
        paymentProofStatus: 'pending' | 'approved' | 'rejected';
        amount: number;
    };
    paymentStatus: string;
    status: string;
    createdAt: string;
}

const formatDate = (dateStr: string): string => {
    try {
        const date = parseISO(dateStr);
        return format(date, "EEEE, d 'Tháng' M, yyyy", { locale: vi });
    } catch {
        return dateStr;
    }
};

const formatTime = (time24h: string): string => {
    try {
        const [hours, minutes] = time24h.split(":");
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
    } catch {
        return time24h;
    }
};

export default function PaymentProofsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);
    const [verifyAction, setVerifyAction] = useState<'approve' | 'reject'>('approve');
    const [rejectionReason, setRejectionReason] = useState('');
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchPendingProofs();
    }, []);

    const fetchPendingProofs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/pending-payment-proofs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách bookings');
            }

            const data = await response.json();
            setBookings(data || []);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    const handleViewImage = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowImageDialog(true);
    };

    const handleVerify = (booking: Booking, action: 'approve' | 'reject') => {
        setSelectedBooking(booking);
        setVerifyAction(action);
        setRejectionReason('');
        setShowVerifyDialog(true);
    };

    const handleConfirmVerify = async () => {
        if (!selectedBooking) return;

        if (verifyAction === 'reject' && !rejectionReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }

        setVerifying(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Chưa đăng nhập');
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bookings/${selectedBooking._id || selectedBooking.id}/verify-payment-proof`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: verifyAction,
                        rejectionReason: verifyAction === 'reject' ? rejectionReason : undefined,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
                throw new Error(errorData.message || 'Không thể xác minh thanh toán');
            }

            // Refresh list
            await fetchPendingProofs();
            setShowVerifyDialog(false);
            setSelectedBooking(null);
            alert(verifyAction === 'approve' ? 'Đã duyệt thanh toán thành công' : 'Đã từ chối thanh toán');
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi xác minh');
        } finally {
            setVerifying(false);
        }
    };

    const totalAmount = (booking: Booking): number => {
        return booking.totalPrice || (booking.bookingAmount + booking.platformFee);
    };

    return (
        <FieldOwnerDashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Xác minh thanh toán</h1>
                        <p className="text-gray-600 mt-1">
                            Duyệt hoặc từ chối ảnh chứng minh thanh toán từ khách hàng
                        </p>
                    </div>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-600">Đang tải danh sách...</p>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : bookings.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg text-gray-600">Không có booking nào cần xác minh</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card key={booking._id || booking.id} className="border border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Booking Info */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">
                                                    {booking.field.name}
                                                </h3>
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">Khách hàng:</span> {booking.user.fullName}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Email:</span> {booking.user.email}
                                                    </p>
                                                    {booking.user.phone && (
                                                        <p>
                                                            <span className="font-medium">SĐT:</span> {booking.user.phone}
                                                        </p>
                                                    )}
                                                    <p>
                                                        <span className="font-medium">Ngày:</span> {formatDate(booking.date)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Thời gian:</span> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Số tiền:</span> {formatCurrency(totalAmount(booking))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Proof Image */}
                                        <div className="md:w-48 flex flex-col items-center justify-center space-y-4">
                                            {booking.transaction?.paymentProofImageUrl ? (
                                                <>
                                                    <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                                                        <img
                                                            src={booking.transaction.paymentProofImageUrl}
                                                            alt="Payment proof"
                                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => handleViewImage(booking)}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewImage(booking)}
                                                        className="w-full"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Xem ảnh
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <p className="text-sm text-gray-500">Không có ảnh</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 justify-center">
                                            <Button
                                                onClick={() => handleVerify(booking, 'approve')}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Duyệt
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleVerify(booking, 'reject')}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Image View Dialog */}
                <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Ảnh chứng minh thanh toán</DialogTitle>
                            <DialogDescription>
                                {selectedBooking && (
                                    <>
                                        Booking: {selectedBooking.field.name} - {formatDate(selectedBooking.date)}
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedBooking?.transaction?.paymentProofImageUrl && (
                            <div className="mt-4">
                                <img
                                    src={selectedBooking.transaction.paymentProofImageUrl}
                                    alt="Payment proof"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Verify Dialog */}
                <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {verifyAction === 'approve' ? 'Duyệt thanh toán' : 'Từ chối thanh toán'}
                            </DialogTitle>
                            <DialogDescription>
                                {verifyAction === 'approve'
                                    ? 'Bạn có chắc chắn muốn duyệt thanh toán này? Booking sẽ được xác nhận.'
                                    : 'Vui lòng nhập lý do từ chối thanh toán này.'}
                            </DialogDescription>
                        </DialogHeader>
                        {verifyAction === 'reject' && (
                            <div className="space-y-2">
                                <Label htmlFor="rejectionReason">Lý do từ chối *</Label>
                                <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối..."
                                    rows={4}
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowVerifyDialog(false)}
                                disabled={verifying}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleConfirmVerify}
                                disabled={verifying || (verifyAction === 'reject' && !rejectionReason.trim())}
                                variant={verifyAction === 'approve' ? 'default' : 'destructive'}
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    verifyAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </FieldOwnerDashboardLayout>
    );
}


