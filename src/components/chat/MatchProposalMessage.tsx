import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { fetchBookingById, createPayOSPayment } from '@/features/booking/bookingThunk';
import { acceptMatchProposal, rejectMatchProposal } from '@/features/matching/matchingThunk';
import { toast } from 'sonner';
import { webSocketService } from '@/features/chat/websocket.service';

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

    const { bookingId, shareAmount, totalAmount } = proposalData;
    const currentUserId = user?._id || (user as any)?.id;

    useEffect(() => {
        if (bookingId) {
            fetchBookingStatus();
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
    }, [bookingId]);

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

    if (!booking && loading) {
        return <div className="p-4 bg-white rounded-lg shadow-sm border"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>;
    }

    if (!booking) {
        // Fallback to static data if booking load fails or strict mode prevents seeing it
        return (
            <Card className="w-[300px] bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Đề xuất chia tiền sân
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pb-2">
                    <p>Đang tải thông tin chi tiết...</p>
                </CardContent>
            </Card>
        );
    }

    const metadata = booking.metadata || {};
    const myPaymentStatus = metadata.payments?.[currentUserId]?.status;
    const proposalStatus = metadata.proposalStatus; // pending, accepted, rejected
    const isCancelled = booking.status === 'cancelled' || proposalStatus === 'rejected';
    const isConfirmed = booking.status === 'confirmed';
    const isFullyPaid = booking.paymentStatus === 'paid';

    const bookingCreatorId = typeof booking.user === 'string' ? booking.user : (booking.user?._id || (booking.user as any)?.id);
    const amIInitiator = bookingCreatorId === currentUserId;
    const isActuallySender = isSender || amIInitiator;

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
    } else if (booking.status === 'cancelled') {
        statusBadge = <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Đã hết hạn</Badge>;
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
                    <span>{format(new Date(booking.date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div className="flex flex-col min-w-0">
                        <span className="truncate font-bold text-slate-700">{booking.field?.name || 'Sân bóng'}</span>
                        {booking.court && (
                            <span className="text-[10px] text-slate-500 font-medium italic">
                                Sân: {booking.court.name || `Sân số ${booking.court.courtNumber}`}
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
                        {(isCancelled || booking.status === 'cancelled') && (
                            <div className="w-full text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                                <XCircle className="w-3 h-3" /> {proposalStatus === 'rejected' ? 'Đã từ chối' : 'Đã đóng / Hết hạn'}
                            </div>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default MatchProposalMessage;
