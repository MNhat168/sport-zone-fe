// CreateTournamentStep2.tsx - Fixed overlay issue
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    CheckCircle2,
    AlertCircle,
    Building,
    Search,
    Filter,
    ChevronRight,
    ChevronLeft,
    Star,
} from 'lucide-react';
import { Loading } from "@/components/ui/loading";
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchAvailableCourts } from '@/features/tournament/tournamentThunk';
import { SPORT_RULES_MAP, SportType } from '../../../src/components/enums/ENUMS';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Step2Props {
    formData: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    nextTrigger?: number;
    backTrigger?: number;
}

interface Court {
    _id: string;
    name: string;
    courtNumber: number;
    sportType: string;
    field: {
        _id: string;
        name: string;
        location: {
            address: string;
            district?: string;
            city?: string;
            coordinates?: {
                lat: number;
                lng: number;
            };
        };
        description: string;
        images?: string[];
        basePrice?: number;
        rating?: number;
        reviews?: number;
        amenities?: string[];
        openingHours?: {
            open: string;
            close: string;
        };
    };
    pricingOverride?: {
        basePrice?: number;
    };
    isActive?: boolean;
    basePrice?: number;
    status?: 'available' | 'reserved' | 'maintenance';
}

export default function CreateTournamentStep2({ formData, onUpdate, onNext, onBack, nextTrigger, backTrigger }: Step2Props) {
    const dispatch = useAppDispatch();
    const { availableCourts, loading } = useAppSelector((state: any) => ({
        availableCourts: (state.tournament as any)?.availableCourts || [],
        loading: (state.tournament as any)?.loading || false,
    }));

    const [selectedCourts, setSelectedCourts] = useState<string[]>(formData.selectedCourtIds || []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchLocation, setSearchLocation] = useState<string>(formData.location || '');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [subStep, setSubStep] = useState<number>(0); // 0: Search Fields, 1: Pick Courts
    const [direction, setDirection] = useState<number>(1);

    const lastNextTrigger = useRef(nextTrigger || 0);
    const lastBackTrigger = useRef(backTrigger || 0);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0
        })
    };

    const sportRules = SPORT_RULES_MAP[formData.sportType as SportType];

    // Triggers from parent
    useEffect(() => {
        if (nextTrigger && nextTrigger > lastNextTrigger.current) {
            lastNextTrigger.current = nextTrigger;
            if (subStep === 0) {
                if (selectedFieldId) {
                    handleFieldSelect(selectedFieldId);
                } else {
                    setErrors({ general: "Vui lòng chọn một địa điểm thi đấu" });
                }
            } else {
                handleNext();
            }
        }
    }, [nextTrigger, subStep]);

    useEffect(() => {
        if (backTrigger && backTrigger > lastBackTrigger.current) {
            lastBackTrigger.current = backTrigger;
            if (subStep === 1) {
                handleBackToFields();
            } else {
                onBack();
            }
        }
    }, [backTrigger, subStep]);

    // Initialize search with form data
    useEffect(() => {
        if (formData.location && formData.sportType && formData.tournamentDate) {
            handleLocationSearch(formData.location);
        }
    }, []);

    const handleLocationSearch = (location: string) => {
        if (!location.trim() || !formData.sportType || !formData.tournamentDate) {
            return;
        }

        setSearchLocation(location);
        onUpdate({ ...formData, location });

        dispatch(fetchAvailableCourts({
            sportType: formData.sportType,
            location: location,
            date: formData.tournamentDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
        }));
    };

    const handleFieldSelect = (fieldId: string) => {
        setDirection(1);
        setSelectedFieldId(fieldId);
        setSubStep(1);
    };

    const handleBackToFields = () => {
        setDirection(-1);
        setSubStep(0);
    };


    const safeAvailableCourts: Court[] = (() => {
        if (!availableCourts) return [];
        if (Array.isArray(availableCourts)) return availableCourts;
        const courtsObj = availableCourts as any;
        if (courtsObj.data && Array.isArray(courtsObj.data)) return courtsObj.data;
        if (courtsObj.success && Array.isArray(courtsObj.data)) return courtsObj.data;
        return [];
    })();

    // Group courts by field
    const courtsByField = safeAvailableCourts.reduce((acc, court) => {
        const fieldId = court.field._id;
        if (!acc[fieldId]) {
            acc[fieldId] = {
                field: court.field,
                courts: []
            };
        }
        acc[fieldId].courts.push(court);
        return acc;
    }, {} as Record<string, { field: any; courts: Court[] }>);

    // Filter fields based on search and price range
    const filteredFields = Object.entries(courtsByField).filter(([_, { field }]) => {
        const matchesSearch = !searchQuery ||
            field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            field.location.address.toLowerCase().includes(searchQuery.toLowerCase());

        const basePrice = field.basePrice || 100000;
        const matchesPrice = basePrice >= priceRange[0] && basePrice <= priceRange[1];

        return matchesSearch && matchesPrice;
    });

    const selectedField = selectedFieldId ? courtsByField[selectedFieldId] : null;

    const handleCourtToggle = (courtId: string, fieldId: string) => {
        setSelectedCourts(prev => {
            const isSelected = prev.includes(courtId);

            // Constraint: Don't allow selecting more than needed
            if (!isSelected && prev.length >= formData.courtsNeeded) {
                setErrors({ selectedCourts: `Bạn đã chọn đủ ${formData.courtsNeeded} sân. Vui lòng hủy chọn bớt nếu muốn thay đổi.` });
                return prev;
            }

            const newSelection = isSelected
                ? prev.filter(id => id !== courtId)
                : [...prev, courtId];

            // Auto-select field when selecting a court
            if (!selectedFieldId && newSelection.includes(courtId)) {
                setSelectedFieldId(fieldId);
            }

            return newSelection;
        });
        setErrors({});
    };

    const calculateTotalCost = () => {
        const selected = safeAvailableCourts.filter(c => selectedCourts.includes(c._id));
        const hours = calculateHours(formData.startTime, formData.endTime);
        return selected.reduce((sum, court) => {
            const basePrice = court.pricingOverride?.basePrice || court.basePrice || court.field?.basePrice || 0;
            return sum + (basePrice * hours);
        }, 0);
    };

    const calculateHours = (startTime: string, endTime: string): number => {
        if (!startTime || !endTime) return 0;
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        return (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.location) newErrors.location = 'Địa điểm là bắt buộc';

        if (!formData.courtsNeeded || formData.courtsNeeded < sportRules.minCourtsRequired) {
            newErrors.courtsNeeded = `Số sân tối thiểu là ${sportRules.minCourtsRequired}`;
        }

        if (formData.courtsNeeded > sportRules.maxCourtsRequired) {
            newErrors.courtsNeeded = `Số sân tối đa là ${sportRules.maxCourtsRequired}`;
        }

        if (selectedCourts.length === 0) {
            newErrors.selectedCourts = 'Vui lòng chọn ít nhất 1 sân';
        }

        if (selectedCourts.length !== formData.courtsNeeded) {
            newErrors.selectedCourts = `Vui lòng chọn đúng ${formData.courtsNeeded} sân`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate({
                ...formData,
                selectedCourtIds: selectedCourts,
                totalCourtCost: calculateTotalCost(),
                fieldsNeeded: formData.courtsNeeded,
                totalFieldCost: calculateTotalCost(),
                selectedFieldIds: selectedCourts.map(courtId => {
                    const court = safeAvailableCourts.find(c => c._id === courtId);
                    return court?.field?._id;
                }).filter(Boolean),
            });
            onNext();
        }
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        setPriceRange([min, max]);
    };

    const hours = calculateHours(formData.startTime, formData.endTime);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                {subStep === 0 ? (
                    <motion.div
                        key="step2-a"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        {/* Searching Fields Section */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-gray-700 font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                                Địa điểm tìm kiếm
                                            </Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={searchLocation}
                                                    onChange={(e) => setSearchLocation(e.target.value)}
                                                    placeholder="Nhập địa chỉ, quận/huyện..."
                                                    className="pl-10 h-12 border-2 border-white focus:border-green-500 rounded-xl bg-white/80 shadow-sm"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch(searchLocation)}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleLocationSearch(searchLocation)}
                                            className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md"
                                            disabled={loading}
                                        >
                                            {loading ? <Loading size={20} /> : "TÌM SÂN"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Filters */}
                                <div className="lg:w-1/4 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Filter className="h-4 w-4" />
                                                Bộ lọc
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">Tên sân/địa chỉ</Label>
                                                <Input
                                                    placeholder="Lọc kết quả..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="bg-gray-50"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-sm">Khoảng giá (VNĐ/giờ)</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        value={priceRange[0]}
                                                        onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                                                        className="h-8 text-xs"
                                                    />
                                                    <span className="text-gray-400">-</span>
                                                    <Input
                                                        type="number"
                                                        value={priceRange[1]}
                                                        onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {[100000, 250000, 500000].map(p => (
                                                        <Badge
                                                            key={p}
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-green-50"
                                                            onClick={() => setPriceRange([0, p])}
                                                        >
                                                            Dưới {p / 1000}k
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Stats Card */}
                                    <Card className="bg-blue-600 text-white overflow-hidden relative">
                                        <div className="absolute right-[-10%] bottom-[-10%] opacity-20">
                                            <Building className="h-24 w-24" />
                                        </div>
                                        <CardContent className="p-6">
                                            <h4 className="font-bold mb-1">Cơ cấu giải đấu</h4>
                                            <p className="text-xs text-blue-100 mb-4">Dựa trên thông tin đã chọn</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-2 bg-white/10 rounded-lg">
                                                    <div className="text-xl font-bold">{formData.courtsNeeded}</div>
                                                    <div className="text-[10px] uppercase font-semibold">Sân cần</div>
                                                </div>
                                                <div className="text-center p-2 bg-white/10 rounded-lg">
                                                    <div className="text-xl font-bold">{hours}h</div>
                                                    <div className="text-[10px] uppercase font-semibold">Thời lượng</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Field Results Grid */}
                                <div className="lg:w-3/4">
                                    {loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <Card key={i} className="animate-pulse h-48 bg-gray-50" />
                                            ))}
                                        </div>
                                    ) : filteredFields.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-700">Không tìm thấy sân</h3>
                                            <p className="text-gray-500">Hãy thử nhập địa chỉ khác hoặc điều chỉnh bộ lọc</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filteredFields.map(([fieldId, { field, courts }]) => (
                                                <Card
                                                    key={fieldId}
                                                    className="group cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-green-300 overflow-hidden"
                                                    onClick={() => handleFieldSelect(fieldId)}
                                                >
                                                    <div className="relative h-40">
                                                        <img
                                                            src={field.images?.[0] || 'https://images.unsplash.com/photo-1541534741688-6078c64b52d2?q=80&w=600&auto=format&fit=crop'}
                                                            alt={field.name}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            {field.rating && (
                                                                <Badge className="bg-white/90 text-yellow-600 border-0 flex items-center gap-1">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                    {field.rating.toFixed(1)}
                                                                </Badge>
                                                            )}
                                                            <Badge className="bg-green-600 text-white border-0">
                                                                {courts.length} sân trống
                                                            </Badge>
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                            <h3 className="text-white font-bold text-lg line-clamp-1">{field.name}</h3>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-4">
                                                            <MapPin className="h-3 w-3 flex-shrink-0 text-red-500" />
                                                            <span className="line-clamp-1">{field.location.address}</span>
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Từ</span>
                                                                <div className="text-lg font-black text-green-700">
                                                                    {field.basePrice?.toLocaleString()} <span className="text-xs font-normal">đ/h</span>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="outline" className="rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                                CHỌN SÂN <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step2-b"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        {/* Picking Courts Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">


                                <div className="flex gap-2">
                                    <Badge variant="outline" className="px-3 py-1 border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold">
                                        CẦN CHỌN: {formData.courtsNeeded}
                                    </Badge>
                                    <Badge variant="outline" className={cn(
                                        "px-3 py-1 border-2 font-bold",
                                        selectedCourts.length === formData.courtsNeeded
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-red-200 bg-red-50 text-red-700"
                                    )}>
                                        ĐÃ CHỌN: {selectedCourts.length}
                                    </Badge>
                                </div>
                            </div>

                            {selectedField && (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="lg:w-1/3">
                                        <Card className="sticky top-6 overflow-hidden border-0 shadow-xl">
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={selectedField.field.images?.[0] || 'https://images.unsplash.com/photo-1541534741688-6078c64b52d2?q=80&w=600&auto=format&fit=crop'}
                                                    alt={selectedField.field.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <CardContent className="p-6">
                                                <h2 className="text-2xl font-black text-gray-900 mb-2">{selectedField.field.name}</h2>
                                                <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                                                    <MapPin className="h-4 w-4 text-red-500" />
                                                    {selectedField.field.location.address}
                                                </p>
                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Xếp hạng</span>
                                                        <div className="flex items-center gap-1 font-bold text-yellow-600">
                                                            <Star className="h-4 w-4 fill-current" />
                                                            {selectedField.field.rating?.toFixed(1) || "5.0"}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Tiện ích</span>
                                                        <div className="flex flex-wrap gap-1 justify-end">
                                                            {selectedField.field.amenities?.slice(0, 3).map((a: string) => (
                                                                <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="lg:w-2/3 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedField.courts.map((court) => {
                                                const basePrice = court.pricingOverride?.basePrice || court.basePrice || court.field?.basePrice || 0;
                                                const courtTotal = basePrice * hours;
                                                const isSelected = selectedCourts.includes(court._id);

                                                return (
                                                    <Card
                                                        key={court._id}
                                                        className={cn(
                                                            "relative cursor-pointer transition-all border-2",
                                                            isSelected
                                                                ? "border-green-500 bg-green-50 shadow-lg scale-[1.02]"
                                                                : "border-gray-100 hover:border-green-200"
                                                        )}
                                                        onClick={() => handleCourtToggle(court._id, selectedField.field._id)}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle2 className="h-6 w-6 text-green-600 fill-white" />
                                                            </div>
                                                        )}
                                                        <CardContent className="p-6">
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={cn(
                                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl",
                                                                    isSelected ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"
                                                                )}>
                                                                    {court.courtNumber}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-gray-500 uppercase font-bold tracking-tighter">Sân con số</div>
                                                                    <div className="font-bold text-lg">Sân {court.courtNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 text-sm pt-4 border-t border-gray-100">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Giá theo giờ:</span>
                                                                    <span className="font-bold">{basePrice.toLocaleString()}đ</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Tổng ({hours}h):</span>
                                                                    <span className="font-bold text-green-700">{courtTotal.toLocaleString()}đ</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {errors.selectedCourts && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.selectedCourts}</AlertDescription>
                                            </Alert>
                                        )}

                                        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-2xl p-6">
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div>
                                                    <div className="text-gray-400 text-sm font-bold uppercase mb-1">Tổng cộng chi phí thuê sân</div>
                                                    <div className="text-4xl font-black text-green-400">
                                                        {calculateTotalCost().toLocaleString()} <span className="text-xl font-normal">VNĐ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}