import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Upload, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { NavbarDarkComponent } from '@/components/header/navbar-dark-component';
import PageWrapper from '@/components/layouts/page-wrapper';
import PageHeader from '@/components/header-banner/page-header';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { createField, createFieldWithImages } from '@/features/field/fieldThunk';
import { clearErrors } from '@/features/field/fieldSlice';
import type { CreateFieldPayload, PriceRange } from '@/types/field-type';
import { toast } from 'sonner';
import { SportType } from '@/types/field-type';
export default function FieldCreatePage() {
    const dispatch = useAppDispatch();
    const { createLoading, createWithImagesLoading, createError, createWithImagesError } = useAppSelector((state) => state.field);
    
    // Tab management
    const [activeTab, setActiveTab] = useState('basic');
    
    // Form state
    const [formData, setFormData] = useState<CreateFieldPayload>({
        name: '',
        sportType: '',
        description: '',
        location: '',
        images: [],
        operatingHours: [],
        slotDuration: 60,
        minSlots: 1,
        maxSlots: 4,
        priceRanges: [],
        basePrice: ''
    });
    
    // UI state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [includes, setIncludes] = useState({
        badmintonRacket: false,
        bats: false,
        hittingMachines: false,
        multipleCourts: false,
        sparePlayers: false,
        instantRacket: false,
        greenTurfs: false
    });
    const [amenities, setAmenities] = useState({
        parking: false,
        drinkingWater: false,
        firstAid: false,
        changeRoom: false,
        shower: false
    });

    const tabs = [
        { id: 'basic', label: 'Thông tin cơ bản' },
        { id: 'price', label: 'Giá sân' },
        { id: 'availability', label: 'Lịch trống' },
        { id: 'overview', label: 'Tổng quan' },
        { id: 'includes', label: 'Bao gồm' },
        { id: 'rules', label: 'Quy định' },
        { id: 'amenities', label: 'Tiện ích' },
        { id: 'gallery', label: 'Thư viện ảnh' },
        { id: 'locations', label: 'Vị trí' }
    ];

    // Form handlers
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOperatingHoursChange = (day: string, field: 'start' | 'end' | 'duration', value: string | number) => {
        setFormData(prev => {
            const existingIndex = prev.operatingHours.findIndex(oh => oh.day === day);
            const updatedHours = [...prev.operatingHours];
            
            if (existingIndex >= 0) {
                updatedHours[existingIndex] = {
                    ...updatedHours[existingIndex],
                    [field]: value
                };
            } else {
                updatedHours.push({
                    day,
                    start: field === 'start' ? value as string : '06:00',
                    end: field === 'end' ? value as string : '22:00',
                    duration: field === 'duration' ? value as number : 60
                });
            }
            
            return {
                ...prev,
                operatingHours: updatedHours
            };
        });
    };

    const handlePriceRangeChange = (index: number, field: keyof PriceRange, value: any) => {
        setFormData(prev => ({
            ...prev,
            priceRanges: prev.priceRanges.map((range, i) => 
                i === index ? { ...range, [field]: value } : range
            )
        }));
    };

    const addPriceRange = (day: string) => {
        setFormData(prev => ({
            ...prev,
            priceRanges: [
                ...prev.priceRanges,
                { day, start: '06:00', end: '22:00', multiplier: 1.0 }
            ]
        }));
    };


    const removePriceRange = (index: number) => {
        setFormData(prev => ({
            ...prev,
            priceRanges: prev.priceRanges.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);
            
            // Create preview URLs
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            return newPreviews.filter((_, i) => i !== index);
        });
    };

    // Form validation
    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên sân');
            return false;
        }
        if (!formData.sportType) {
            toast.error('Vui lòng chọn loại sân');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Vui lòng nhập mô tả sân');
            return false;
        }
        if (!formData.location.trim()) {
            toast.error('Vui lòng nhập địa chỉ sân');
            return false;
        }
        if (!formData.basePrice || Number(formData.basePrice) <= 0) {
            toast.error('Vui lòng nhập giá cơ bản hợp lệ');
            return false;
        }
        if (selectedDays.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ngày hoạt động');
            return false;
        }
        const availableDays = selectedDays.filter(day => dayAvailability[day] === true);
        if (availableDays.length === 0) {
            toast.error('Vui lòng bật ít nhất một ngày hoạt động');
            return false;
        }
        return true;
    };

    // Form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            dispatch(clearErrors());
            
            // Convert basePrice to number before sending
            // Filter operating hours and price ranges to only include selected and available days
            const filteredOperatingHours = formData.operatingHours.filter(oh => 
                selectedDays.includes(oh.day) && dayAvailability[oh.day] === true
            );
            
            const filteredPriceRanges = formData.priceRanges.filter(pr => 
                selectedDays.includes(pr.day) && dayAvailability[pr.day] === true
            );
            
            const submitData = {
                ...formData,
                basePrice: Number(formData.basePrice),
                operatingHours: filteredOperatingHours,
                priceRanges: filteredPriceRanges
            };
            
            // Console log all values before sending to backend
            console.log('=== FIELD CREATE DATA BEFORE SENDING TO BACKEND ===');
            console.log('🔍 Filtering Process:');
            console.log('  - Selected Days:', selectedDays);
            console.log('  - Day Availability:', dayAvailability);
            console.log('  - Original Operating Hours:', formData.operatingHours);
            console.log('  - Filtered Operating Hours:', filteredOperatingHours);
            console.log('  - Original Price Ranges:', formData.priceRanges);
            console.log('  - Filtered Price Ranges:', filteredPriceRanges);
            console.log('📋 Basic Information:');
            console.log('  - Name:', submitData.name);
            console.log('  - Sport Type:', submitData.sportType);
            console.log('  - Description:', submitData.description);
            console.log('  - Location:', submitData.location);
            
            console.log('💰 Pricing Information:');
            console.log('  - Base Price:', submitData.basePrice, 'VND');
            console.log('  - Slot Duration:', submitData.slotDuration, 'minutes');
            console.log('  - Min Slots:', submitData.minSlots);
            console.log('  - Max Slots:', submitData.maxSlots);
            
            console.log('🕐 Operating Hours:');
            if (submitData.operatingHours.length === 0) {
                console.log('  - No operating hours configured');
            } else {
                submitData.operatingHours.forEach((hours, index) => {
                    console.log(`  - Day ${index + 1}: ${hours.day}`);
                    console.log(`    Start: ${hours.start}`);
                    console.log(`    End: ${hours.end}`);
                    console.log(`    Duration: ${hours.duration} minutes`);
                });
            }
            
            console.log('💵 Price Ranges:');
            if (submitData.priceRanges.length === 0) {
                console.log('  - No price ranges configured');
            } else {
                submitData.priceRanges.forEach((range, index) => {
                    console.log(`  - Range ${index + 1}: ${range.day}`);
                    console.log(`    Time: ${range.start} - ${range.end}`);
                    console.log(`    Multiplier: ${range.multiplier}x`);
                    console.log(`    Calculated Price: ${submitData.basePrice * range.multiplier} VND`);
                });
            }
            
            console.log('🖼️ Images:');
            console.log('  - Image Files Count:', imageFiles.length);
            console.log('  - Preview Images Count:', previewImages.length);
            if (imageFiles.length > 0) {
                imageFiles.forEach((file, index) => {
                    console.log(`  - Image ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                });
            }
            
            console.log('✅ Includes:');
            Object.entries(includes).forEach(([key, value]) => {
                console.log(`  - ${key}: ${value ? '✅' : '❌'}`);
            });
            
            console.log('🏢 Amenities:');
            Object.entries(amenities).forEach(([key, value]) => {
                console.log(`  - ${key}: ${value ? '✅' : '❌'}`);
            });
            
            console.log('📊 Selected Days:');
            console.log('  - Days:', selectedDays);
            console.log('  - Day Availability:', dayAvailability);
            
            console.log('📤 Final Submit Data Object:');
            console.log(JSON.stringify(submitData, null, 2));
            console.log('=== END OF FIELD CREATE DATA ===');
            
            if (imageFiles.length > 0) {
                // Create field with images
                console.log('🚀 Sending data to backend WITH images...');
                await dispatch(createFieldWithImages({ 
                    payload: submitData, 
                    images: imageFiles 
                })).unwrap();
                toast.success('Tạo sân thành công với hình ảnh!');
            } else {
                // Create field without images
                console.log('🚀 Sending data to backend WITHOUT images...');
                await dispatch(createField(submitData)).unwrap();
                toast.success('Tạo sân thành công!');
            }
            
            // Reset form
            setFormData({
                name: '',
                sportType: '',
                description: '',
                location: '',
                images: [],
                operatingHours: [],
                slotDuration: 60,
                minSlots: 1,
                maxSlots: 4,
                priceRanges: [],
                basePrice: ''
            });
            setImageFiles([]);
            setPreviewImages([]);
            setActiveTab('basic');
            
        } catch (error) {
            console.error('Error creating field:', error);
        }
    };

    // Error handling effect
    useEffect(() => {
        if (createError) {
            toast.error(createError.message || 'Có lỗi xảy ra khi tạo sân');
        }
        if (createWithImagesError) {
            toast.error(createWithImagesError.message || 'Có lỗi xảy ra khi tạo sân với hình ảnh');
        }
    }, [createError, createWithImagesError]);
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [dayAvailability, setDayAvailability] = useState<Record<string, boolean>>({})
    const [editingDay, setEditingDay] = useState<string | null>(null)
    
    // Available days and multipliers for user selection
    const availableDays = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' }
    ];
    
    const availableMultipliers = [
        { value: 0.5, label: '0.5x (50% off)' },
        { value: 0.8, label: '0.8x (20% off)' },
        { value: 1.0, label: '1.0x (Normal price)' },
        { value: 1.2, label: '1.2x (20% premium)' },
        { value: 1.5, label: '1.5x (50% premium)' },
        { value: 2.0, label: '2.0x (100% premium)' }
    ];

    const toggleDay = (day: string) => {
        setSelectedDays((prev) => {
            if (prev.includes(day)) {
                // Remove day and clean up related data
                setFormData(formData => ({
                    ...formData,
                    operatingHours: formData.operatingHours.filter(oh => oh.day !== day),
                    priceRanges: formData.priceRanges.filter(pr => pr.day !== day)
                }));
                setDayAvailability(prev => {
                    const newAvailability = { ...prev };
                    delete newAvailability[day];
                    return newAvailability;
                });
                return prev.filter((d) => d !== day);
            } else {
                // Add day and create default operating hours
                setFormData(formData => {
                    const existingHours = formData.operatingHours.find(oh => oh.day === day);
                    if (!existingHours) {
                        return {
                            ...formData,
                            operatingHours: [
                                ...formData.operatingHours,
                                {
                                    day,
                                    start: '06:00',
                                    end: '22:00',
                                    duration: 60
                                }
                            ]
                        };
                    }
                    return formData;
                });
                setDayAvailability(prev => ({
                    ...prev,
                    [day]: true
                }));
                return [...prev, day];
            }
        });
    }

    const toggleDayAvailability = (day: string) => {
        setDayAvailability((prev) => ({
            ...prev,
            [day]: !prev[day],
        }))
    }

    const handleEditDay = (day: string) => {
        setEditingDay(editingDay === day ? null : day)
    }


    const handleResetAvailability = () => {
        setSelectedDays([])
        setDayAvailability({})
        setFormData(prev => ({
            ...prev,
            operatingHours: [],
            priceRanges: []
        }))
        console.log("Đã reset lịch trống")
    }

    const handleSaveAvailability = () => {
        console.log("Đã lưu lịch trống", { selectedDays, dayAvailability })
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader title="Tạo sân" breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Tạo sân" }]} />
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto space-y-12">
                        {/* Tab Navigation */}
                        <Card className="shadow-md border-0">
                            <CardContent className="pt-5">
                                <div className="flex flex-wrap gap-3.5 justify-center">
                                    {tabs.map(tab => (
                                        <Button
                                            key={tab.id}
                                            variant={activeTab === tab.id ? 'default' : 'outline'}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`h-12 border-0 shadow-sm transition-colors ${
                                                activeTab === tab.id 
                                                    ? 'bg-black text-white hover: hover:!text-white' 
                                                    : 'bg-white text-gray-700 hover:bg-black hover:text-white'
                                            }`}
                                        >
                                            {tab.label}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Info Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label>
                                            Tên sân <span className="text-red-600">*</span>
                                        </Label>
                                        <Input 
                                            placeholder="Nhập tên sân" 
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label>
                                            Loại sân <span className="text-red-600">*</span>
                                        </Label>
                                        <Select 
                                            value={formData.sportType}
                                            onValueChange={(value) => handleInputChange('sportType', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại sân" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(SportType).map((sport) => (
                                                    <SelectItem key={sport} value={sport}>
                                                        {sport}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Price Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Giá cơ bản</CardTitle>
                                        <span className="text-xl font-semibold text-gray-500">(VND)</span>
                                    </div>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2.5">
                                        <Label>Giá cơ bản (VND) <span className="text-red-600">*</span></Label>
                                        <Input 
                                            placeholder="Nhập giá cơ bản" 
                                            type="number" 
                                            value={formData.basePrice}
                                            onChange={(e) => handleInputChange('basePrice', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label>Thời lượng slot (phút)</Label>
                                        <Input 
                                            type="number"
                                            placeholder="60"
                                            value={formData.slotDuration}
                                            onChange={(e) => handleInputChange('slotDuration', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label>Số slot tối đa</Label>
                                        <Input 
                                            type="number"
                                            placeholder="4"
                                            value={formData.maxSlots}
                                            onChange={(e) => handleInputChange('maxSlots', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Availability Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold">Availability</CardTitle>
                                    <ChevronDown className="w-5 h-5 rotate-180" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Select Days */}
                                <div className="space-y-2.5">
                                    <h3 className="text-xl font-semibold">Select Days</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {availableDays.map((day) => (
                                            <Button
                                                key={day.value}
                                                variant="outline"
                                                onClick={() => toggleDay(day.value)}
                                                className={`min-w-24 px-8 py-3.5 rounded-[5px] transition-colors ${selectedDays.includes(day.value)
                                                        ? "border-emerald-600 text-emerald-600"
                                                        : "border-gray-300 text-gray-700"
                                                    }`}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Day Availability Cards */}
                                <div className="space-y-4">
                                    {selectedDays.map((day) => {
                                        const dayInfo = availableDays.find(d => d.value === day);
                                        return (
                                            <Card key={day} className="shadow-lg border-0">
                                                <CardContent className="py-6">
                                                    <div className="flex items-center justify-between">
                                                         <div className="flex items-center gap-4">
                                                             <button
                                                                 onClick={() => toggleDayAvailability(day)}
                                                                 className="cursor-pointer"
                                                             >
                                                                 {dayAvailability[day] ? (
                                                                     <ToggleRight className="w-6 h-6 text-emerald-600" />
                                                                 ) : (
                                                                     <ToggleLeft className="w-6 h-6 text-gray-400" />
                                                                 )}
                                                             </button>
                                                             <h4 className="text-2xl font-semibold">{dayInfo?.label || day}</h4>
                                                         </div>
                                                        <Button
                                                            variant="link"
                                                            onClick={() => handleEditDay(day)}
                                                            className="text-emerald-600 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>

                                                {editingDay === day && (
                                                    <div className="mt-6 space-y-6 pt-6 border-t">
                                                        {/* Operating Hours */}
                                                        <div className="space-y-4">
                                                            <Label className="text-lg font-semibold">Giờ hoạt động</Label>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg shadow-md">
                                                                <div className="space-y-2">
                                                                    <Label>Giờ mở cửa</Label>
                                                                    <Input 
                                                                        type="time"
                                                                        value={formData.operatingHours.find(oh => oh.day === day)?.start || '06:00'}
                                                                        onChange={(e) => handleOperatingHoursChange(day, 'start', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Giờ đóng cửa</Label>
                                                                    <Input 
                                                                        type="time"
                                                                        value={formData.operatingHours.find(oh => oh.day === day)?.end || '22:00'}
                                                                        onChange={(e) => handleOperatingHoursChange(day, 'end', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Thời lượng slot (phút)</Label>
                                                                    <Input 
                                                                        type="number"
                                                                        value={formData.operatingHours.find(oh => oh.day === day)?.duration || 60}
                                                                        onChange={(e) => handleOperatingHoursChange(day, 'duration', Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Price Ranges */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-lg font-semibold">Khung giờ giá</Label>
                                                                <Button 
                                                                    type="button" 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => addPriceRange(day)}
                                                                    className="border-0"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1" />
                                                                    Thêm khung giờ
                                                                </Button>
                                                            </div>
                                                            
                                                            {formData.priceRanges.filter(range => range.day === day).map((range) => {
                                                                const globalIndex = formData.priceRanges.findIndex(r => r === range);
                                                                return (
                                                                    <div key={globalIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg shadow-md">
                                                                        <div className="space-y-2">
                                                                            <Label>Giờ bắt đầu</Label>
                                                                            <Input 
                                                                                type="time"
                                                                                value={range.start}
                                                                                onChange={(e) => handlePriceRangeChange(globalIndex, 'start', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>Giờ kết thúc</Label>
                                                                            <Input 
                                                                                type="time"
                                                                                value={range.end}
                                                                                onChange={(e) => handlePriceRangeChange(globalIndex, 'end', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>Hệ số giá</Label>
                                                                            <Select 
                                                                                value={range.multiplier.toString()}
                                                                                onValueChange={(value) => handlePriceRangeChange(globalIndex, 'multiplier', Number(value))}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {availableMultipliers.map((multiplier) => (
                                                                                        <SelectItem key={multiplier.value} value={multiplier.value.toString()}>
                                                                                            {multiplier.label}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>Thao tác</Label>
                                                                            <Button 
                                                                                type="button"
                                                                                variant="destructive" 
                                                                                size="sm"
                                                                                onClick={() => removePriceRange(globalIndex)}
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                        );
                                    })}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-5 pt-6">
                                    <Button
                                        variant="default"
                                        onClick={handleResetAvailability}
                                        className="min-w-24 px-8 py-3.5 bg-emerald-700 text-white border-emerald-700 rounded-[10px]"
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        onClick={handleSaveAvailability}
                                        className="min-w-36 px-6 py-3.5 bg-gray-800 text-white rounded-[10px] hover:!bg-green-800"
                                    >
                                        Save Change
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Venue Overview Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Tổng quan sân</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2.5">
                                    <Label>Mô tả sân <span className="text-red-600">*</span></Label>
                                    <Textarea
                                        placeholder="Nhập mô tả chi tiết về sân"
                                        className="min-h-[200px]"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Includes Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Bao gồm</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(includes).map(([key, checked]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(c) => setIncludes(prev => ({ ...prev, [key]: c }))}
                                                className="data-[state=checked]:bg-emerald-700"
                                            />
                                            <Label className="text-gray-600">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Venue Rules Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Quy định sân</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <Input placeholder="Nhập quy định" />
                                <Button variant="link" className="text-red-600 p-0">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Thêm quy định
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Amenities Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Tiện ích</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-6">
                                    {Object.entries(amenities).map(([key, checked]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(c) => setAmenities(prev => ({ ...prev, [key]: c }))}
                                                className="data-[state=checked]:bg-emerald-700"
                                            />
                                            <Label className="text-gray-600">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gallery Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Thư viện ảnh</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2.5">
                                    <Label>Hình ảnh sân của bạn</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center space-y-2">
                                        <Upload className="w-10 h-10 mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-600">Tải lên thư viện ảnh</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            Chọn ảnh
                                        </Button>
                                    </div>
                                </div>

                                {previewImages.length > 0 && (
                                    <div className="flex gap-2.5 flex-wrap">
                                        {previewImages.map((img, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-24 h-24 rounded-lg object-cover" />
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                    onClick={() => removeImage(idx)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-sm text-gray-600">
                                    Đặt ảnh chính làm ảnh đầu tiên<br />
                                    Ảnh phải có kích thước tối thiểu 152 * 152. Định dạng hỗ trợ: JPG, PNG, SVG
                                </p>
                            </CardContent>
                        </Card>

                        {/* Location Section */}
                        <Card className="shadow-md border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Vị trí</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2.5">
                                    <Label>
                                        Địa chỉ sân <span className="text-red-600">*</span>
                                    </Label>
                                    <Input 
                                        placeholder="Nhập địa chỉ đầy đủ của sân" 
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label>Bản đồ</Label>
                                    <div className="h-96 bg-orange-100 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-2 left-2 bg-white p-3 rounded shadow-lg max-w-xs">
                                            <h4 className="font-medium text-sm">Vị trí sân</h4>
                                            <p className="text-xs text-gray-600 mt-1.5">
                                                {formData.location || 'Chưa nhập địa chỉ'}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                <span className="text-xs text-blue-600">Chỉ đường</span>
                                            </div>
                                            <button className="text-xs text-blue-600 mt-2">Xem bản đồ lớn hơn</button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-center">
                            <Button 
                                size="lg" 
                                className="px-8"
                                onClick={handleSubmit}
                                disabled={createLoading || createWithImagesLoading}
                            >
                                {createLoading || createWithImagesLoading ? 'Đang tạo sân...' : 'Lưu sân'}
                            </Button>
                        </div>

                    </div>
                </div>
            </PageWrapper>
        </>
    );
}