import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle, Loader2, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { fetchBookingById, createPayOSPayment } from '@/features/booking/bookingThunk';
import { acceptMatchProposal, rejectMatchProposal } from '@/features/matching/matchingThunk';
import { toast } from 'sonner';
import { webSocketService } from '@/features/chat/websocket.service';
import axiosPrivate from '@/utils/axios/axiosPrivate';

interface MatchProposalMessageProps {
    content: string; // JSON string
    isSender: boolean;
}

const MatchProposalMessage: React.FC<MatchProposalMessageProps> = ({ content, isSender }) => {
    const dispatch = useAppDispatch();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const { user } = useAppSelector((state) => state.auth);

    let proposalData: any = {};
    try {
        proposalData = JSON.parse(content);
    } catch (e) {
        return <div className="text-red-500 text-xs">Invalid proposal format</div>;
    }

    const { bookingId, shareAmount, totalAmount, fieldName, courtName, date, startTime, endTime, proposerId } = proposalData;
    const currentUserId = user?._id || (user as any)?.id;
    const amIInitiator = proposerId === currentUserId;
    const isActuallySender = isSender || amIInitiator;

    useEffect(() => {
        if (bookingId) {
            fetchBookingStatus();

            // ✅ FIX: Check if we just returned from a successful payment
            const params = new URLSearchParams(window.location.search);
            const statusParam = params.get('status');
            const bookingIdParam = params.get('bookingId');

            if (bookingIdParam === bookingId && (statusParam === 'PAID' || statusParam === 'SUCCESS')) {
                toast.success('Thanh toán thành công! Đang cập nhật trạng thái...');
                // Retry a few times if the webhook is slow
                let attempts = 0;
                const interval = setInterval(async () => {
                    attempts++;
                    const result = await dispatch(fetchBookingById(bookingId)).unwrap();
                    const metadata = result.metadata || {};
                    const myStatus = metadata.payments?.[currentUserId]?.status;

                    if (myStatus === 'paid' || attempts > 5) {
                        setBooking(result);
                        clearInterval(interval);
                    }
                }, 2000);

                return () => clearInterval(interval);
            }
        }

        // Listen for real-time updates
        const handleUpdate = (data: any) => {
            if (data.bookingId === bookingId) {
                // Refresh booking data when update signal received
                fetchBookingStatus();
            }
        };

        if (webSocketService) {
            webSocketService.on('proposal_updated', handleUpdate);
        }

        return () => {
            if (webSocketService) {
                webSocketService.off('proposal_updated', handleUpdate);
            }
        };
    }, [bookingId, currentUserId]);

    const fetchBookingStatus = async () => {
        setLoading(true);
        try {
            const result = await dispatch(fetchBookingById(bookingId)).unwrap();
            setBooking(result);
        } catch (error) {
            console.error('Failed to fetch booking', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setIsActionLoading(true);
        try {
            await dispatch(acceptMatchProposal({ matchId: proposalData.matchId, bookingId })).unwrap();
            toast.success('Đã chấp nhận đề xuất!');
            fetchBookingStatus();
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        setIsActionLoading(true);
        try {
            await dispatch(rejectMatchProposal({ matchId: proposalData.matchId, bookingId })).unwrap();
            toast.success('Đã từ chối đề xuất');
            fetchBookingStatus();
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePay = async () => {
        setIsActionLoading(true);
        try {
            const result = await dispatch(createPayOSPayment(bookingId)).unwrap();
            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                toast.error('Không tìm thấy link thanh toán');
            }
        } catch (error: any) {
            toast.error(error || 'Lỗi tạo thanh toán');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReport = async () => {
        const reason = window.prompt('Lý do báo cáo người dùng này (ví dụ: Không thanh toán đặt sân):');
        if (!reason) return;

        setIsActionLoading(true);
        try {
            // Get reported user ID (the other participant)
            const metadata = booking?.metadata || {};
            const payments = metadata.payments || {};
            const reportedUserId = Object.keys(payments).find(uid => uid !== currentUserId);

            if (!reportedUserId) {
                toast.error('Không tìm thấy người dùng để báo cáo');
                return;
            }

            await axiosPrivate.post('/reports', {
                category: 'payment_issue',
                subject: `Báo cáo người dùng không thanh toán - Booking ${bookingId}`,
                description: `Lý do: ${reason}\n\nChi tiết:\n- Booking ID: ${bookingId}\n- Người bị báo cáo: ${reportedUserId}\n- Trạng thái thanh toán của họ: ${payments[reportedUserId]?.status || 'unknown'}`,
            });

            toast.success('Đã gửi báo cáo người dùng. Chúng tôi sẽ xem xét và xử lý.');
        } catch (error: any) {
            console.error('Report error:', error);
            toast.error('Gửi báo cáo thất bại');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!booking && loading) {
        return <div className="p-4 bg-white rounded-lg shadow-sm border"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;
    }

    // If booking is not loaded yet, we can still show the card if we have the fallback data
    const displayBooking = booking || {
        date: date,
        startTime: startTime,
        endTime: endTime,
        status: 'pending',
        field: { name: fieldName },
        court: { name: courtName },
        metadata: {
            proposalStatus: 'pending',
            payments: {
                [proposerId]: { status: 'unpaid' },
                [currentUserId]: { status: 'unpaid' }
            }
        }
    };

    const metadata = displayBooking.metadata || {};
    const myPaymentStatus = metadata.payments?.[currentUserId]?.status;
    const opponentId = Object.keys(metadata.payments || {}).find(uid => uid !== currentUserId);
    const opponentPaymentStatus = opponentId ? metadata.payments[opponentId]?.status : null;

    const proposalStatus = metadata.proposalStatus; // pending, accepted, rejected
    const isCancelled = displayBooking.status === 'cancelled' || proposalStatus === 'rejected';

    // ✅ CRITICAL FIX: Use metadata for true "fully paid" status in split payments
    const isFullyPaid = metadata.splitPayment
        ? Object.values(metadata.payments || {}).every((p: any) => p.status === 'paid')
        : displayBooking.paymentStatus === 'paid';

    const isOpponentUnpaid = isCancelled && myPaymentStatus === 'paid' && opponentPaymentStatus !== 'paid';

    // For fallback when booking is not yet loaded
    const bookingCreatorId = displayBooking.user
        ? (typeof displayBooking.user === 'string' ? displayBooking.user : (displayBooking.user?._id || (displayBooking.user as any)?.id))
        : proposerId;

    // Status Badge Logic
    let statusBadge = <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Chờ xác nhận</Badge>;
    let statusText: React.ReactNode = null;

    if (proposalStatus === 'pending' && !isCancelled) {
        if (isActuallySender) {
            statusBadge = <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Đang gửi</Badge>;
            statusText = (
                <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-2">
                    <p className="text-[11px] text-blue-700 font-medium text-center leading-tight">
                        Đang chờ đối phương xác nhận. Bạn có thể hủy đề xuất nếu muốn.
                    </p>
                </div>
            );
        } else {
            statusBadge = <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Cần xử lý</Badge>;
            statusText = (
                <div className="bg-yellow-50/50 p-2 rounded-lg border border-yellow-100 mb-2">
                    <p className="text-[11px] text-yellow-700 font-medium text-center leading-tight">
                        Bạn nhận được lời mời chơi cùng. Hãy xác nhận hoặc từ chối đề xuất này.
                    </p>
                </div>
            );
        }
    } else if (proposalStatus === 'accepted') {
        if (isFullyPaid) {
            statusBadge = <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Hoàn tất</Badge>;
            statusText = <span className="text-sm font-bold text-green-600 block text-center mb-2 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Đã đặt sân thành công!</span>;
        } else if (myPaymentStatus === 'paid') {
            statusBadge = <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Chờ đối phương</Badge>;
            statusText = <span className="text-xs text-slate-500 italic block text-center mb-2">Đã thanh toán 1/2. Chờ đối phương hoàn tất.</span>;
        } else {
            statusBadge = <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Chờ thanh toán</Badge>;
        }
    } else if (proposalStatus === 'rejected') {
        statusBadge = <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Đã từ chối</Badge>;
    } else if (isOpponentUnpaid) {
        statusBadge = <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Bị hủy (Đối phương không trả)</Badge>;
        statusText = (
            <div className="bg-red-50/50 p-2 rounded-lg border border-red-100 mb-2">
                <p className="text-[11px] text-red-700 font-medium text-center leading-tight">
                    Đặt sân đã bị hệ thống hủy do đối phương không hoàn tất thanh toán. Bạn sẽ được hoàn tiền.
                </p>
            </div>
        );
    } else if (displayBooking.status === 'cancelled') {
        statusBadge = <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Đã hết hạn / Hủy</Badge>;
    }

    return (
        <Card className={`w-[320px] bg-white shadow-md border-slate-200 overflow-hidden ${!isActuallySender && proposalStatus === 'pending' ? 'ring-2 ring-yellow-400/50 ring-offset-0' : ''}`}>
            <div className={`p-3 border-b flex justify-between items-center ${isActuallySender ? 'bg-slate-50' : 'bg-yellow-50/50'}`}>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    {isActuallySender ? '📤 Bạn đã gửi đề xuất' : '📥 Lời mời chơi mới'}
                </span>
                {statusBadge}
            </div>

            <CardContent className="p-4 space-y-3">
                {statusText}
                <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{displayBooking.date ? format(new Date(displayBooking.date), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{displayBooking.startTime} - {displayBooking.endTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div className="flex flex-col min-w-0">
                        <span className="truncate font-bold text-slate-700">{displayBooking.field?.name || 'Sân bóng'}</span>
                        {displayBooking.court && (
                            <span className="text-[10px] text-slate-500 font-medium italic">
                                Sân: {displayBooking.court.name || `Sân số ${displayBooking.court.courtNumber}`}
                            </span>
                        )}
                    </div>
                </div>

                <div className="pt-2 border-t flex justify-between text-sm">
                    <span className="text-slate-500">Tổng tiền:</span>
                    <span className="font-medium line-through decoration-slate-400 text-slate-400 decoration-1">{totalAmount?.toLocaleString()}đ</span>
                </div>
                {!isFullyPaid && (
                    <div className="flex justify-between items-center bg-primary/5 p-2 rounded-md">
                        <span className="text-sm font-bold text-slate-700">Phần bạn phải trả:</span>
                        <span className="text-lg font-black text-primary">{shareAmount?.toLocaleString()}đ</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-slate-50 border-t gap-2">
                {isActionLoading ? (
                    <Button disabled className="w-full h-9"><Loader2 className="w-4 h-4 animate-spin" /></Button>
                ) : (
                    <>
                        {/* CASE 1: RECEIVER + PENDING => Accept/Reject */}
                        {!isActuallySender && proposalStatus === 'pending' && !isCancelled && (
                            <>
                                <Button variant="outline" onClick={handleReject} className="flex-1 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                    Từ chối
                                </Button>
                                <Button onClick={handleAccept} className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                                    Chấp nhận
                                </Button>
                            </>
                        )}

                        {/* CASE 2: SENDER + PENDING => Cancel (Reject) */}
                        {isActuallySender && proposalStatus === 'pending' && !isCancelled && (
                            <Button variant="outline" onClick={handleReject} className="w-full h-9 text-slate-500 hover:text-red-500 hover:bg-red-50">
                                Hủy đề xuất
                            </Button>
                        )}

                        {/* CASE 3: ACCEPTED + UNPAID => PAY */}
                        {proposalStatus === 'accepted' && myPaymentStatus !== 'paid' && !isFullyPaid && !isCancelled && (
                            <Button onClick={handlePay} className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse">
                                Thanh toán ngay
                            </Button>
                        )}

                        {/* CASE 4: PAID or COMPLETED */}
                        {(myPaymentStatus === 'paid' || isFullyPaid) && !isCancelled && (
                            <div className="w-full text-center text-xs font-medium text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {isFullyPaid ? 'Hoàn tất thủ tục' : 'Bạn đã thanh toán'}
                            </div>
                        )}

                        {/* CASE 5: REJECTED or CANCELLED */}
                        {isCancelled && !isOpponentUnpaid && (
                            <div className="w-full text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                                <XCircle className="w-3 h-3" /> {proposalStatus === 'rejected' ? 'Đã từ chối' : 'Đã đóng / Hết hạn'}
                            </div>
                        )}

                        {/* CASE 6: OPPONENT UNPAID (REPORT ABILITY) */}
                        {isOpponentUnpaid && (
                            <div className="w-full space-y-2">
                                <div className="text-center text-xs font-medium text-red-400 flex items-center justify-center gap-1 mb-1">
                                    <AlertCircle className="w-3 h-3" /> Đối phương không thanh toán
                                </div>
                                <Button
                                    onClick={handleReport}
                                    variant="outline"
                                    className="w-full h-8 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Flag className="w-3 h-3 mr-1" /> Báo cáo người dùng này
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default MatchProposalMessage;
