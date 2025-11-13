// In CreateTournamentStep2.tsx - update the component
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchAvailableFields } from '@/features/tournament/tournamentThunk';
import { SPORT_RULES_MAP, SportType } from '../../../src/components/enums/ENUMS';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Step2Props {
    formData: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

// Define the Field interface based on your API response
interface Field {
    _id: string;
    name: string;
    sportType: string;
    description: string;
    location: any; // Adjust based on your actual location structure
    basePrice?: number;
    images?: string[];
    isActive?: boolean;
}

export default function CreateTournamentStep2({ formData, onNext, onUpdate, onBack }: Step2Props) {
    const dispatch = useAppDispatch();
    const { availableFields, loading, error } = useAppSelector((state) => state.tournament);
    const [selectedFields, setSelectedFields] = useState<string[]>(formData.selectedFieldIds || []);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sportRules = SPORT_RULES_MAP[formData.sportType as SportType];

    useEffect(() => {
        if (formData.sportType && formData.location && formData.startDate) {
            console.log('Dispatching fetchAvailableFields with:', {
                sportType: formData.sportType,
                location: formData.location,
                date: formData.startDate,
            });
            dispatch(fetchAvailableFields({
                sportType: formData.sportType,
                location: formData.location,
                date: formData.startDate,
            }));
        }
    }, [dispatch, formData.sportType, formData.location, formData.startDate]);

    // Debug: Log the available fields whenever they change
    useEffect(() => {
        console.log('Available fields in component:', availableFields);
        console.log('Selected fields:', selectedFields);
    }, [availableFields, selectedFields]);

    const handleChange = (field: string, value: any) => {
        onUpdate({ ...formData, [field]: value });
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const safeAvailableFields: Field[] = (() => {
        if (!availableFields) return [];
        if (Array.isArray(availableFields)) return availableFields;
        if (availableFields.data && Array.isArray(availableFields.data)) return availableFields.data;
        if (availableFields.success && Array.isArray(availableFields.data)) return availableFields.data;
        return [];
    })();

    const handleFieldToggle = (fieldId: string) => {
        setSelectedFields(prev => {
            const newSelection = prev.includes(fieldId)
                ? prev.filter(id => id !== fieldId)
                : [...prev, fieldId];

            console.log('Field toggled. New selection:', newSelection);
            return newSelection;
        });
        setErrors({});
    };

    const calculateTotalCost = () => {
        const selected = safeAvailableFields.filter(f => selectedFields.includes(f._id));
        const hours = calculateHours(formData.startTime, formData.endTime);
        return selected.reduce((sum, field) => sum + ((field.basePrice || 0) * hours), 0);
    };

    const calculateHours = (startTime: string, endTime: string): number => {
        if (!startTime || !endTime) return 0;
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        return (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // ADDED location validation in Step 2
        if (!formData.location) newErrors.location = 'Địa điểm là bắt buộc';

        if (!formData.fieldsNeeded || formData.fieldsNeeded < sportRules.minFieldsRequired) {
            newErrors.fieldsNeeded = `Số sân tối thiểu là ${sportRules.minFieldsRequired}`;
        }

        if (formData.fieldsNeeded > sportRules.maxFieldsRequired) {
            newErrors.fieldsNeeded = `Số sân tối đa là ${sportRules.maxFieldsRequired}`;
        }

        if (selectedFields.length === 0) {
            newErrors.selectedFields = 'Vui lòng chọn ít nhất 1 sân';
        }

        if (selectedFields.length !== formData.fieldsNeeded) {
            newErrors.selectedFields = `Vui lòng chọn đúng ${formData.fieldsNeeded} sân`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate({
                ...formData,
                selectedFieldIds: selectedFields,
                totalFieldCost: calculateTotalCost(),
            });
            onNext();
        }
    };

    // Calculate hours for display
    const hours = calculateHours(formData.startTime, formData.endTime);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-6 w-6" />
                        Chọn Địa Điểm & Sân Thi Đấu
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Debug info - remove in production */}
                    <div className="bg-yellow-50 p-3 rounded-md text-sm">
                        <p>Debug: Found {safeAvailableFields.length} fields</p>
                        <p>Selected: {selectedFields.length}/{formData.fieldsNeeded}</p>
                    </div>

                    {/* ADDED Location field in Step 2 */}
                    <div>
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Địa Điểm *
                        </Label>
                        <Input
                            id="location"
                            value={formData.location || ''}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="VD: Đà Nẵng"
                            className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>

                    {/* Fields Needed */}
                    <div>
                        <Label htmlFor="fieldsNeeded">
                            Số Sân Cần Thiết * (Từ {sportRules.minFieldsRequired} đến {sportRules.maxFieldsRequired})
                        </Label>
                        <Input
                            id="fieldsNeeded"
                            type="number"
                            min={sportRules.minFieldsRequired}
                            max={sportRules.maxFieldsRequired}
                            value={formData.fieldsNeeded || sportRules.minFieldsRequired}
                            onChange={(e) => onUpdate({ ...formData, fieldsNeeded: parseInt(e.target.value) || 1 })}
                            className={errors.fieldsNeeded ? 'border-red-500' : ''}
                        />
                        {errors.fieldsNeeded && <p className="text-red-500 text-sm mt-1">{errors.fieldsNeeded}</p>}
                    </div>

                    {/* Field Selection */}
                    <div>
                        <Label>
                            Chọn Sân ({selectedFields.length}/{formData.fieldsNeeded})
                        </Label>
                        {errors.selectedFields && (
                            <p className="text-red-500 text-sm mt-1">{errors.selectedFields}</p>
                        )}

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Đang tải danh sách sân...</p>
                            </div>
                        ) : safeAvailableFields.length === 0 ? (
                            <div className="text-center py-8">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Không tìm thấy sân phù hợp. Vui lòng thử:
                                        <ul className="list-disc list-inside mt-2 text-left">
                                            <li>Thay đổi địa điểm tìm kiếm</li>
                                            <li>Thử ngày khác</li>
                                            <li>Kiểm tra lại môn thể thao</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {safeAvailableFields.map((field) => {
                                    const fieldPrice = field.basePrice || 0;
                                    const totalCost = fieldPrice * hours;

                                    return (
                                        <Card
                                            key={field._id}
                                            className={`cursor-pointer transition-all ${selectedFields.includes(field._id)
                                                ? 'border-green-600 border-2 bg-green-50'
                                                : 'hover:border-gray-400'
                                                }`}
                                            onClick={() => handleFieldToggle(field._id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Checkbox
                                                                checked={selectedFields.includes(field._id)}
                                                                onCheckedChange={() => handleFieldToggle(field._id)}
                                                            />
                                                            <h3 className="font-semibold text-lg">{field.name}</h3>
                                                            {selectedFields.includes(field._id) && (
                                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                                            <MapPin className="h-4 w-4" />
                                                            {field.location?.address || field.location || 'Địa chỉ không xác định'}
                                                        </p>

                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                                <DollarSign className="h-4 w-4" />
                                                                {fieldPrice.toLocaleString()} VNĐ/giờ
                                                            </span>
                                                            <Badge variant="outline">
                                                                {field.sportType}
                                                            </Badge>
                                                        </div>

                                                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            Tổng: {totalCost.toLocaleString()} VNĐ
                                                        </div>

                                                        {field.description && (
                                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                                {field.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {field.images && field.images[0] && (
                                                        <img
                                                            src={field.images[0]}
                                                            alt={field.name}
                                                            className="w-20 h-20 object-cover rounded ml-4"
                                                        />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cost Summary */}
                    {selectedFields.length > 0 && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Tổng Chi Phí Sân:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {calculateTotalCost().toLocaleString()} VNĐ
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Sân sẽ được đặt tạm thời. Thanh toán sẽ được thực hiện khi đủ {formData.minParticipants} người đăng ký.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <Button onClick={onBack} variant="outline">
                            Quay Lại
                        </Button>
                        <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                            Tiếp Theo
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}