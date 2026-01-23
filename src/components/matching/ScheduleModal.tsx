import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Trophy, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: any;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, match }) => {
    if (!match) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Lịch chơi chi tiết
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Sport and Match Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-primary/10 rounded-lg">
                                <Trophy className="w-5 h-5 text-primary" />
                            </span>
                            <div>
                                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Môn thể thao</h4>
                                <p className="text-sm font-medium">{match.sportType}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                                Đã xác nhận
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                <Calendar size={14} />
                                Ngày chơi
                            </div>
                            <p className="font-bold text-slate-900 border-l-2 border-primary/30 pl-2 ml-1">
                                {match.scheduledDate ? format(new Date(match.scheduledDate), 'dd/MM/yyyy') : 'N/A'}
                            </p>
                        </div>

                        {/* Time */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                <Clock size={14} />
                                Thời gian
                            </div>
                            <p className="font-bold text-slate-900 border-l-2 border-primary/30 pl-2 ml-1">
                                {match.scheduledStartTime} - {match.scheduledEndTime}
                            </p>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-slate-800">{match.fieldId?.name || match.field?.name || 'Sân bóng'}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {match.fieldId?.address || match.field?.address || 'Địa chỉ đang cập nhật...'}
                                </p>
                            </div>
                        </div>

                        {match.courtId && (
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                <Hash className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">
                                    Sân số: {match.courtId?.courtNumber || match.court?.courtNumber || 'N/A'}
                                    {match.courtId?.name ? ` (${match.courtId.name})` : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 italic">
                        <p className="text-[11px] text-blue-700 leading-tight">
                            * Vui lòng có mặt trước 15 phút tại sân để chuẩn bị. Chúc bạn có một trận đấu tuyệt vời!
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="w-full">Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleModal;
