"use client";

import { useEffect } from "react";
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy, MapPin, Check, X } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
    fetchFieldOwnerTournamentRequests,
    acceptTournamentRequest,
    rejectTournamentRequest
} from "@/features/tournament/tournamentThunk";
import { formatCurrency } from "@/utils/format-currency";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

export default function TournamentRequestsPage() {
    const dispatch = useAppDispatch();
    const { tournamentRequests, loading, error } = useAppSelector((state) => state.tournament);

    useEffect(() => {
        dispatch(fetchFieldOwnerTournamentRequests());
    }, [dispatch]);

    const handleAccept = async (reservationId: string) => {
        try {
            await dispatch(acceptTournamentRequest(reservationId)).unwrap();
            toast.success("Đã chấp nhận yêu cầu đặt sân!");
        } catch (error: any) {
            toast.error(error || "Không thể chấp nhận yêu cầu");
        }
    };

    const handleReject = async (reservationId: string) => {
        if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;
        try {
            await dispatch(rejectTournamentRequest(reservationId)).unwrap();
            toast.success("Đã từ chối yêu cầu đặt sân");
        } catch (error: any) {
            toast.error(error || "Không thể từ chối yêu cầu");
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(parseISO(dateStr), "EEEE, d MMMM, yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    const pendingRequests = tournamentRequests.filter((r: any) => r.status === 'pending');
    const confirmedRequests = tournamentRequests.filter((r: any) => r.status === 'confirmed');

    const RequestList = ({ requests, type }: { requests: any[], type: 'pending' | 'confirmed' }) => {
        if (requests.length === 0) {
            return (
                <Card className="border-dashed border-2 py-12 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-4">
                            <Trophy className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {type === 'pending' ? "Chưa có yêu cầu mới" : "Chưa có yêu cầu nào được xác nhận"}
                        </h3>
                        <p className="text-gray-500 max-w-sm mt-1">
                            {type === 'pending'
                                ? "Khi có nhà tổ chức giải đấu gửi yêu cầu đặt sân, chúng sẽ xuất hiện ở đây."
                                : "Các yêu cầu bạn đã chấp nhận sẽ được lưu trữ và hiển thị tại đây."}
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request: any) => (
                    <Card key={request._id} className={`overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow ${type === 'confirmed' ? 'opacity-90' : ''}`}>
                        <div className={`h-2 w-full ${type === 'confirmed' ? 'bg-green-500' : 'bg-primary'}`} />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2">
                                    {request.tournament?.sportType}
                                </Badge>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(request.estimatedCost, "VND")}
                                    </span>
                                    {type === 'confirmed' && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 mt-1">
                                            Đã xác nhận
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-xl line-clamp-1">{request.tournament?.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-orange-500" />
                                    <span>Phân loại: {request.tournament?.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>Ngày: {formatDate(request.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-green-500" />
                                    <span>Thời gian: {request.startTime} - {request.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 rounded-md border border-blue-100">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    <span className="font-semibold text-blue-700">Sân: {request.court?.name || `Sân ${request.court?.courtNumber}`}</span>
                                </div>
                            </div>

                            {type === 'pending' && (
                                <div className="pt-2 flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleAccept(request._id)}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Chấp nhận
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleReject(request._id)}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Từ chối
                                    </Button>
                                </div>
                            )}

                            {type === 'confirmed' && (
                                <div className="pt-2">
                                    <p className="text-xs text-center text-gray-400 italic">
                                        Yêu cầu này đã được chuyển thành lịch đặt sân chính thức.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <FieldOwnerDashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu đặt sân cho giải đấu</h1>
                        <p className="text-gray-500">Quản lý các yêu cầu đặt sân từ các nhà tổ chức giải đấu</p>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200 text-sm max-w-md">
                        <Info className="h-5 w-5 flex-shrink-0" />
                        <p>Lưu ý: Một giải đấu có thể gửi nhiều yêu cầu nếu họ cần đặt nhiều sân cùng lúc.</p>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loading size={32} />
                    </div>
                )}

                {error && (
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="py-4 text-red-600">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {!loading && (
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="pending" className="relative px-6">
                                Chờ xử lý
                                {pendingRequests.length > 0 && (
                                    <Badge className="ml-2 bg-primary text-white h-5 min-w-5 flex items-center justify-center rounded-full p-0">
                                        {pendingRequests.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="confirmed" className="px-6">
                                Đã xác nhận
                                {confirmedRequests.length > 0 && (
                                    <Badge variant="outline" className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full p-0">
                                        {confirmedRequests.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-0">
                            <RequestList requests={pendingRequests} type="pending" />
                        </TabsContent>

                        <TabsContent value="confirmed" className="mt-0">
                            <RequestList requests={confirmedRequests} type="confirmed" />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </FieldOwnerDashboardLayout>
    );
}
