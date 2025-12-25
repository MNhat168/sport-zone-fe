// CreateTournamentStep2.tsx - Fixed overlay issue
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Building,
    Search,
    Filter,
    ChevronRight,
    ChevronLeft,
    Star,
    Users,
    Calendar,
    X,
    Loader2,
    Minus,
    Plus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchAvailableCourts } from '@/features/tournament/tournamentThunk';
import { SPORT_RULES_MAP, SportType } from '../../../src/components/enums/ENUMS';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Step2Props {
    formData: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
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

export default function CreateTournamentStep2({ formData, onUpdate, onNext, onBack }: Step2Props) {
    const dispatch = useAppDispatch();
    const { availableCourts, loading, error } = useAppSelector((state: any) => ({
        availableCourts: (state.tournament as any)?.availableCourts || [],
        loading: (state.tournament as any)?.loading || false,
        error: (state.tournament as any)?.error || null
    }));

    const [selectedCourts, setSelectedCourts] = useState<string[]>(formData.selectedCourtIds || []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchLocation, setSearchLocation] = useState<string>(formData.location || '');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [showSearchBar, setShowSearchBar] = useState<boolean>(!formData.location);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const sportRules = SPORT_RULES_MAP[formData.sportType as SportType];

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

        console.log('Dispatching fetchAvailableCourts with:', {
            sportType: formData.sportType,
            location: location,
            date: formData.tournamentDate,
        });

        // Start transition
        setIsTransitioning(true);

        // Dispatch fetch action
        dispatch(fetchAvailableCourts({
            sportType: formData.sportType,
            location: location,
            date: formData.tournamentDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
        }));

        // Hide search bar after a short delay to allow animation
        setTimeout(() => {
            setShowSearchBar(false);
            setIsTransitioning(false);
            // Scroll to content after transition
            setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }, 300);
    };

    const handleResetSearch = () => {
        setIsTransitioning(true);
        setShowSearchBar(true);
        setSelectedFieldId(null);
        setSearchQuery('');
        setSearchLocation('');
        onUpdate({ ...formData, location: '' });
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleChange = (field: string, value: any) => {
        onUpdate({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
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
            const newSelection = prev.includes(courtId)
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
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Search Bar Section - Full width when active */}
            <div
                className={`transition-all duration-500 ease-in-out ${showSearchBar
                    ? 'opacity-100 translate-x-0 h-auto'
                    : 'opacity-0 -translate-x-full h-0 overflow-hidden'
                    }`}
                ref={searchBarRef}
            >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
                    <CardContent className="p-8 md:p-12">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
                                    <MapPin className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Tìm Địa Điểm Cho Giải Đấu
                                </h2>
                                <p className="text-gray-600">
                                    Nhập địa điểm để tìm các sân thể thao phù hợp
                                </p>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    placeholder="Ví dụ: Quận 1, TP.HCM hoặc 123 Nguyễn Văn Linh"
                                    className="pl-10 py-6 text-lg border-2 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleLocationSearch(searchLocation);
                                        }
                                    }}
                                />
                                {searchLocation && (
                                    <button
                                        onClick={() => setSearchLocation('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                        <Building className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Chọn Sân</h4>
                                    <p className="text-sm text-gray-600">Từ {sportRules.minCourtsRequired}-{sportRules.maxCourtsRequired} sân</p>
                                </div>

                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Ngày {new Date(formData.tournamentDate).toLocaleDateString('vi-VN')}</h4>
                                    <p className="text-sm text-gray-600">{formData.startTime} - {formData.endTime}</p>
                                </div>

                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">{formData.maxParticipants} Người</h4>
                                    <p className="text-sm text-gray-600">{formData.numberOfTeams} đội thi đấu</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleLocationSearch(searchLocation)}
                                disabled={!searchLocation.trim() || isTransitioning}
                                className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Đang tìm kiếm...
                                    </>
                                ) : (
                                    <>
                                        Tìm Sân
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                            {error && (
                                <Alert variant="destructive" className="mt-6">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Section - Only shows when search bar is hidden */}
            <div
                className={`transition-all duration-500 ease-in-out ${!showSearchBar
                    ? 'opacity-100 translate-x-0 h-auto'
                    : 'opacity-0 translate-x-full h-0 overflow-hidden'
                    }`}
                ref={contentRef}
            >
                <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                    {/* Left Sidebar - Filter and Field List */}
                    <div className="lg:w-2/5 flex flex-col">
                        <Card className="flex-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Danh Sách Sân
                                        </CardTitle>
                                        <CardDescription>
                                            {filteredFields.length} sân tìm thấy tại {searchLocation}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetSearch}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Đổi địa điểm
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Search and Filter */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Tìm tên sân hoặc địa chỉ..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Khoảng giá</Label>
                                            <span className="text-sm text-gray-600">
                                                {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VNĐ/giờ
                                            </span>
                                        </div>

                                        {/* Custom Price Range Selector */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    value={priceRange[0]}
                                                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                                                    min={0}
                                                    max={priceRange[1]}
                                                    className="w-full"
                                                    placeholder="Tối thiểu"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <Input
                                                    type="number"
                                                    value={priceRange[1]}
                                                    onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                                                    min={priceRange[0]}
                                                    max={500000}
                                                    className="w-full"
                                                    placeholder="Tối đa"
                                                />
                                            </div>

                                            {/* Quick Price Filters */}
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePriceRangeChange(0, 100000)}
                                                    className={`${priceRange[0] === 0 && priceRange[1] === 100000 ? 'bg-green-50 border-green-300' : ''}`}
                                                >
                                                    Dưới 100K
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePriceRangeChange(100000, 250000)}
                                                    className={`${priceRange[0] === 100000 && priceRange[1] === 250000 ? 'bg-green-50 border-green-300' : ''}`}
                                                >
                                                    100K - 250K
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePriceRangeChange(250000, 500000)}
                                                    className={`${priceRange[0] === 250000 && priceRange[1] === 500000 ? 'bg-green-50 border-green-300' : ''}`}
                                                >
                                                    250K - 500K
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Filter className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">Lọc theo:</span>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                            <Star className="h-3 w-3 mr-1" />
                                            Đánh giá cao
                                        </Badge>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            Giá thấp
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Field List */}
                                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-green-600" />
                                            <p className="text-gray-500">Đang tải danh sách sân...</p>
                                        </div>
                                    ) : filteredFields.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Không tìm thấy sân phù hợp. Vui lòng thử tìm kiếm lại.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    ) : (
                                        filteredFields.map(([fieldId, { field }]) => {
                                            const basePrice = field.basePrice || 100000;
                                            const totalCost = basePrice * hours;
                                            const isSelected = selectedFieldId === fieldId;

                                            return (
                                                <Card
                                                    key={fieldId}
                                                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-green-500 border-2 bg-green-50' : 'border-gray-200'}`}
                                                    onClick={() => setSelectedFieldId(fieldId)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h3 className="font-semibold text-lg line-clamp-1">
                                                                        {field.name}
                                                                    </h3>
                                                                    {field.rating && (
                                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                                            <Star className="h-3 w-3 fill-current" />
                                                                            {field.rating.toFixed(1)}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                                                    <span className="line-clamp-1">{field.location.address}</span>
                                                                </p>

                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-green-600 font-semibold">
                                                                        {totalCost.toLocaleString()} VNĐ
                                                                    </span>
                                                                    <Badge variant="outline">
                                                                        {courtsByField[fieldId].courts.length} sân
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            {isSelected && (
                                                                <ChevronRight className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content - Field Details and Court Selection */}
                    <div className="lg:w-3/5 flex flex-col">
                        <Card className="flex-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <span>
                                        {selectedField ? selectedField.field.name : 'Chọn một sân'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-sm">
                                            Cần chọn: {formData.courtsNeeded} sân
                                        </Badge>
                                        <Badge variant="secondary">
                                            Đã chọn: {selectedCourts.length}/{formData.courtsNeeded}
                                        </Badge>
                                    </div>
                                </CardTitle>
                                {selectedField && (
                                    <CardDescription className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {selectedField.field.location.address}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-6 overflow-y-auto">
                                {!selectedField ? (
                                    <div className="text-center py-12">
                                        <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            Chọn một sân để xem chi tiết
                                        </h3>
                                        <p className="text-gray-500">
                                            Nhấn vào sân trong danh sách bên trái để xem các sân con và đặt chỗ
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Field Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                {selectedField.field.images?.[0] && (
                                                    <img
                                                        src={selectedField.field.images[0]}
                                                        alt={selectedField.field.name}
                                                        className="w-32 h-32 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        {selectedField.field.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                                <span className="font-semibold">{selectedField.field.rating.toFixed(1)}</span>
                                                                <span className="text-gray-500 text-sm">
                                                                    ({selectedField.field.reviews || 0} đánh giá)
                                                                </span>
                                                            </div>
                                                        )}
                                                        <Badge variant="outline">
                                                            {selectedField.field.basePrice?.toLocaleString()} VNĐ/giờ
                                                        </Badge>
                                                    </div>

                                                    <p className="text-gray-700 mb-3">
                                                        {selectedField.field.description}
                                                    </p>

                                                    {selectedField.field.amenities && selectedField.field.amenities.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedField.field.amenities.slice(0, 3).map((amenity: string, index: number) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {amenity}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Courts Selection */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-semibold text-lg">Các Sân Con</h4>
                                                    <span className="text-sm text-gray-500">
                                                        {selectedCourts.filter(id =>
                                                            selectedField.courts.some(c => c._id === id)
                                                        ).length}/{formData.courtsNeeded} đã chọn
                                                    </span>
                                                </div>

                                                {errors.selectedCourts && (
                                                    <Alert variant="destructive" className="mb-4">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription>{errors.selectedCourts}</AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedField.courts.map((court) => {
                                                        const basePrice = court.pricingOverride?.basePrice || court.basePrice || court.field?.basePrice || 0;
                                                        const totalCost = basePrice * hours;
                                                        const isSelected = selectedCourts.includes(court._id);

                                                        return (
                                                            <Card
                                                                key={court._id}
                                                                className={`cursor-pointer transition-all ${isSelected
                                                                    ? 'border-green-600 border-2 bg-green-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                onClick={() => handleCourtToggle(court._id, selectedField.field._id)}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <Checkbox
                                                                                    checked={isSelected}
                                                                                    onCheckedChange={() => handleCourtToggle(court._id, selectedField.field._id)}
                                                                                />
                                                                                <h5 className="font-semibold">
                                                                                    Sân {court.courtNumber}
                                                                                </h5>
                                                                                {isSelected && (
                                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                                )}
                                                                            </div>

                                                                            <div className="space-y-2 text-sm">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-gray-600">Giá:</span>
                                                                                    <span className="font-semibold text-green-600">
                                                                                        {basePrice.toLocaleString()} VNĐ/giờ
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-gray-600">Tổng:</span>
                                                                                    <span className="font-semibold">
                                                                                        {totalCost.toLocaleString()} VNĐ
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Summary */}
                                        {selectedCourts.length > 0 && (
                                            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">Tổng Chi Phí</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {selectedCourts.length} sân × {hours} giờ
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-green-600">
                                                                {calculateTotalCost().toLocaleString()} VNĐ
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Đã bao gồm thuế
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        ⓘ Sân sẽ được đặt tạm thời. Thanh toán chỉ thực hiện khi đủ số lượng đăng ký.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            {/* Action Buttons */}
                            <div className="p-6 border-t">
                                <div className="flex items-center justify-between">
                                    <Button onClick={onBack} variant="outline" size="lg">
                                        Quay Lại
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Tổng chi phí</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {calculateTotalCost().toLocaleString()} VNĐ
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleNext}
                                            size="lg"
                                            className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                            disabled={selectedCourts.length === 0}
                                        >
                                            Tiếp Theo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}