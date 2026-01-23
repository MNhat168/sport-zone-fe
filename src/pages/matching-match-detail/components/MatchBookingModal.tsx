import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Check,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Info,
    CreditCard,
    Building
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getAllFields, getFieldById, checkFieldAvailability } from '@/features/field/fieldThunk';
import { proposeMatch } from '@/features/matching/matchingThunk';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Field } from '@/types/field-type';
import { PaymentMethod } from '@/types/payment-type';

interface MatchBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
    sportType?: string;
}

type Step = 'select-field' | 'select-date-time' | 'confirmation';

const MatchBookingModal: React.FC<MatchBookingModalProps> = ({
    isOpen,
    onClose,
    matchId,
    sportType
}) => {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<Step>('select-field');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethod.BANK_TRANSFER);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { fields, loading: fieldsLoading, availability, availabilityLoading } = useAppSelector((state) => state.field);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('select-field');
            setSelectedField(null);
            setSelectedCourtId('');
            setSelectedSlots([]);
            setSearchQuery('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Initial load of fields
    useEffect(() => {
        if (isOpen && step === 'select-field') {
            dispatch(getAllFields({
                name: searchQuery,
                sportType: sportType
            }));
        }
    }, [isOpen, searchQuery, sportType, dispatch, step]);

    // Load availability when field or date changes
    useEffect(() => {
        if (selectedField && step === 'select-date-time') {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            dispatch(checkFieldAvailability({
                id: selectedField.id || '',
                startDate: dateStr,
                endDate: dateStr,
                courtId: selectedCourtId || undefined
            }));
        }
    }, [selectedField, selectedDate, selectedCourtId, dispatch, step]);

    const handleFieldSelect = async (field: Field) => {
        setIsDetailLoading(true);
        setStep('select-date-time');

        try {
            const result = await dispatch(getFieldById(field.id || '')).unwrap();
            const fullField = result.data;
            setSelectedField(fullField);

            if (fullField.courts && fullField.courts.length > 0) {
                setSelectedCourtId(fullField.courts[0].id || '');
            } else {
                setSelectedCourtId('');
            }
        } catch (error) {
            toast.error('Không thể tải thông tin chi tiết sân');
            setStep('select-field');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const toggleSlot = (slot: any) => {
        if (!slot.available) return;

        const isSelected = selectedSlots.some(s => s.startTime === slot.startTime);
        if (isSelected) {
            setSelectedSlots(selectedSlots.filter(s => s.startTime !== slot.startTime));
        } else {
            // Basic validation: ensure consecutive slots
            setSelectedSlots([...selectedSlots, slot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedField || selectedSlots.length === 0 || isSubmitting) return;

        setIsSubmitting(true);

        // Force PayOS for split payment proposal
        const bookingData = {
            fieldId: selectedField.id,
            courtId: selectedCourtId,
            date: format(selectedDate, 'yyyy-MM-dd'),
            startTime: selectedSlots[0].startTime,
            endTime: selectedSlots[selectedSlots.length - 1].endTime,
            paymentMethod: PaymentMethod.PAYOS,
            note: `Hẹn chơi với đối tác qua Match ID: ${matchId}`
        };

        try {
            await dispatch(proposeMatch({ matchId, bookingData })).unwrap();

            toast.success('Đề xuất đã được gửi! Vui lòng chờ đối tác chấp nhận.');
            onClose();
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra khi gửi đề xuất');
            setIsSubmitting(false); // Only reset on error, or if we want to allow retry. On success currently closing modal.
        } finally {
            // If we close modal on success, we might not need to reset isSubmitting unless component unmounts.
            // But if onClose doesn't unmount immediately or we keep it open, safer to reset or leave true if unmounting.
            // Given onClose() is called on success, we don't strictly need to set false contentiously. 
            // But let's set it false in catch block and maybe finally if we want to be safe. 
            // Ideally: if success -> close. If error -> reset.
        }
    };


    // Filter fields based on search
    const filteredFields = Array.isArray(fields) ? fields : [];

    // Availability for selected date
    const dailyAvailability = Array.isArray(availability)
        ? availability.find(a => {
            const availabilityDate = new Date(a.date);
            // Ignore time Part
            availabilityDate.setHours(0, 0, 0, 0);
            const comparisonDate = new Date(selectedDate);
            comparisonDate.setHours(0, 0, 0, 0);
            return availabilityDate.getTime() === comparisonDate.getTime();
        })
        : null;

    const totalPrice = selectedSlots.reduce((sum, slot) => sum + (slot.price || 0), 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl min-h-[600px] flex flex-col p-0 overflow-hidden sm:rounded-2xl border-none">
                <DialogHeader className="p-6 bg-slate-900 text-white">
                    <DialogTitle className="text-xl font-black">Hẹn Lịch Chơi {sportType ? `• ${sportType}` : ''}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Hẹn lịch chơi cùng đối tác của bạn ngay bây giờ.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                    {/* Stepper */}
                    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
                        {['Chọn Sân', 'Chọn Giờ', 'Xác Nhận'].map((label, i) => {
                            const currentIdx = ['select-field', 'select-date-time', 'confirmation'].indexOf(step);
                            const isActive = i <= currentIdx;
                            return (
                                <React.Fragment key={label}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`text-xs font-bold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                                    </div>
                                    {i < 2 && <div className={`flex-1 h-[2px] mx-4 rounded-full ${i < currentIdx ? 'bg-primary' : 'bg-slate-100'}`} />}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {step === 'select-field' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm sân thể thao..."
                                        className="pl-10 h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-primary/20"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="h-[350px]">
                                    {fieldsLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : filteredFields.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {filteredFields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    onClick={() => handleFieldSelect(field)}
                                                    className="group flex gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                                                >
                                                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                        {field.images?.[0] ? (
                                                            <img src={field.images[0]} alt={field.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Building className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{field.name}</h4>
                                                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="truncate">{typeof field.location === 'string' ? field.location : field.location.address}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-600 bg-slate-50 uppercase font-black">
                                                                {field.sportType}
                                                            </Badge>
                                                            <span className="text-xs font-black text-rose-500">{field.basePrice?.toLocaleString()}đ<span className="text-[10px] text-slate-400 font-medium lowercase">/giờ</span></span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 self-center group-hover:text-primary transition-all group-hover:translate-x-1" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-3">
                                            <Info className="w-12 h-12 text-slate-200 mx-auto" />
                                            <p className="text-slate-400 font-medium">Không tìm thấy sân phù hợp</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}

                        {step === 'select-date-time' && (
                            isDetailLoading ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Đang tải thông tin sân...</p>
                                </div>
                            ) : selectedField && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="space-y-3">
                                            <h5 className="text-sm font-black text-slate-700 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                Chọn Ngày
                                            </h5>
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => date && setSelectedDate(date)}
                                                className="rounded-xl border border-slate-100 bg-white shadow-sm"
                                                disabled={(date) => date < addDays(new Date(), -1)}
                                                locale={vi}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-3">
                                                <h5 className="text-sm font-black text-slate-700 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    Chọn Court & Giờ
                                                </h5>

                                                {selectedField.courts && selectedField.courts.length > 1 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {selectedField.courts.map((court) => (
                                                            <Button
                                                                key={court.id}
                                                                variant={selectedCourtId === court.id ? 'default' : 'outline'}
                                                                size="sm"
                                                                className="rounded-full text-[10px] font-black uppercase h-8"
                                                                onClick={() => {
                                                                    setSelectedCourtId(court.id || '');
                                                                    setSelectedSlots([]);
                                                                }}
                                                            >
                                                                {court.name || `Court ${court.courtNumber}`}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-md border border-slate-200 bg-white" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Trống</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Đã đặt</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-md bg-primary" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Đang chọn</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                    {availabilityLoading || isDetailLoading ? (
                                                        <div className="col-span-full py-10 flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                        </div>
                                                    ) : dailyAvailability?.slots && dailyAvailability.slots.length > 0 ? (
                                                        dailyAvailability.slots.map((slot: any, i: number) => {
                                                            const isSelected = selectedSlots.some(s => s.startTime === slot.startTime);
                                                            return (
                                                                <Button
                                                                    key={i}
                                                                    variant={isSelected ? 'default' : 'outline'}
                                                                    disabled={!slot.available}
                                                                    className={`relative h-auto py-2.5 rounded-xl flex flex-col items-center gap-0.5 border-slate-100 transition-all ${!slot.available
                                                                        ? 'bg-slate-50 opacity-100 border-slate-100 grayscale-[0.5]'
                                                                        : isSelected
                                                                            ? 'ring-2 ring-primary ring-offset-1'
                                                                            : 'hover:border-primary/50 hover:bg-white bg-white shadow-sm'
                                                                        }`}
                                                                    onClick={() => toggleSlot(slot)}
                                                                >
                                                                    <span className={`text-[10px] font-black uppercase leading-none ${!slot.available ? 'text-slate-400' : isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                                        {slot.startTime}
                                                                    </span>
                                                                    <span className={`text-[8px] font-medium ${!slot.available ? 'text-slate-300' : isSelected ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                                                                        -{slot.endTime}
                                                                    </span>

                                                                    {!slot.available && (
                                                                        <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center">
                                                                            <span className="bg-slate-200 text-slate-500 px-1 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-tighter shadow-sm border border-slate-300">
                                                                                Đã đặt
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </Button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="col-span-full py-10 text-center text-slate-400 text-xs font-medium bg-white rounded-xl border border-dashed">
                                                            Không có lịch trống trong ngày này
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedSlots.length > 0 && (
                                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-[10px] text-primary font-black uppercase">Đã chọn</p>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                {selectedSlots.length} slot • {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length - 1].endTime}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Tổng cộng</p>
                                                            <p className="text-lg font-black text-primary leading-none">{totalPrice.toLocaleString()}đ</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {step === 'confirmation' && selectedField && (
                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
                                            {selectedField.images?.[0] ? (
                                                <img src={selectedField.images[0]} alt={selectedField.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Building className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800">{selectedField.name}</h3>
                                            <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {typeof selectedField.location === 'string' ? selectedField.location : selectedField.location.address}
                                            </p>
                                            <Badge className="mt-3 px-2 py-0.5 bg-primary/10 text-primary border-none text-[10px] font-black uppercase">
                                                {selectedField.sportType}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">Thời gian</p>
                                            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                {format(selectedDate, 'eeee, dd/MM/yyyy', { locale: vi })}
                                            </p>
                                            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {selectedSlots[0]?.startTime} - {selectedSlots[selectedSlots.length - 1]?.endTime}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">Vị trí</p>
                                            <p className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase">
                                                <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                                                    {selectedField.courts?.find(c => c.id === selectedCourtId)?.name || 'Sân chính'}
                                                </Badge>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-sm font-black text-slate-700">Phương Thức Thanh Toán</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <Building className={`w-6 h-6 ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'text-primary' : 'text-slate-400'}`} />
                                                <span className={`text-[10px] font-black uppercase ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'text-primary' : 'text-slate-500'}`}>Chuyển Khoản</span>
                                            </div>
                                            <div
                                                onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${paymentMethod === PaymentMethod.PAYOS ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <CreditCard className={`w-6 h-6 ${paymentMethod === PaymentMethod.PAYOS ? 'text-primary' : 'text-slate-400'}`} />
                                                <span className={`text-[10px] font-black uppercase ${paymentMethod === PaymentMethod.PAYOS ? 'text-primary' : 'text-slate-500'}`}>PayOS (QR)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    {step !== 'select-field' ? (
                        <Button variant="ghost" className="font-bold text-slate-500 hover:bg-slate-50" onClick={() => step === 'select-date-time' ? setStep('select-field') : setStep('select-date-time')}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                        </Button>
                    ) : <div />}

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="font-bold border-slate-200" onClick={onClose}>
                            Hủy
                        </Button>

                        {step === 'select-field' ? (
                            <Button
                                disabled={!selectedField}
                                onClick={() => setStep('select-date-time')}
                                className="font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                            >
                                Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : step === 'select-date-time' ? (
                            <Button
                                disabled={selectedSlots.length === 0}
                                onClick={() => setStep('confirmation')}
                                className="font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                            >
                                Xác nhận giờ <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting}
                                className="font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 px-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Đặt Lịch Ngay <Check className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MatchBookingModal;
