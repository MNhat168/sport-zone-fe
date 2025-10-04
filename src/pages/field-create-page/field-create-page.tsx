import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, X, Upload, MapPin } from 'lucide-react';
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
        operatingHours: {
            start: '06:00',
            end: '22:00'
        },
        slotDuration: 60,
        minSlots: 1,
        maxSlots: 4,
        priceRanges: [
            {
                start: '06:00',
                end: '10:00',
                multiplier: 1.0
            },
            {
                start: '10:00',
                end: '18:00',
                multiplier: 1.2
            },
            {
                start: '18:00',
                end: '22:00',
                multiplier: 1.5
            }
        ],
        basePrice: 0
    });
    
    // UI state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [includes, setIncludes] = useState({
        badmintonRacket: true,
        bats: true,
        hittingMachines: true,
        multipleCourts: true,
        sparePlayers: true,
        instantRacket: false,
        greenTurfs: false
    });
    const [amenities, setAmenities] = useState({
        parking: true,
        drinkingWater: true,
        firstAid: true,
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

    const handleOperatingHoursChange = (field: 'start' | 'end', value: string) => {
        setFormData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [field]: value
            }
        }));
    };

    const handlePriceRangeChange = (index: number, field: keyof PriceRange, value: any) => {
        setFormData(prev => ({
            ...prev,
            priceRanges: prev.priceRanges.map((range, i) => 
                i === index ? { ...range, [field]: value } : range
            )
        }));
    };

    const addPriceRange = () => {
        setFormData(prev => ({
            ...prev,
            priceRanges: [
                ...prev.priceRanges,
                { start: '00:00', end: '23:59', multiplier: 1.0 }
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
        if (formData.basePrice <= 0) {
            toast.error('Vui lòng nhập giá cơ bản hợp lệ');
            return false;
        }
        return true;
    };

    // Form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            dispatch(clearErrors());
            
            if (imageFiles.length > 0) {
                // Create field with images
                await dispatch(createFieldWithImages({ 
                    payload: formData, 
                    images: imageFiles 
                })).unwrap();
                toast.success('Tạo sân thành công với hình ảnh!');
            } else {
                // Create field without images
                await dispatch(createField(formData)).unwrap();
                toast.success('Tạo sân thành công!');
            }
            
            // Reset form
            setFormData({
                name: '',
                sportType: '',
                description: '',
                location: '',
                images: [],
                operatingHours: { start: '06:00', end: '22:00' },
                slotDuration: 60,
                minSlots: 1,
                maxSlots: 4,
                priceRanges: [
                    { start: '06:00', end: '10:00', multiplier: 1.0 },
                    { start: '10:00', end: '18:00', multiplier: 1.2 },
                    { start: '18:00', end: '22:00', multiplier: 1.5 }
                ],
                basePrice: 0
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

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader title="Tạo sân" breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Tạo sân" }]} />
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto space-y-12">
                        {/* Tab Navigation */}
                        <Card>
                            <CardContent className="pt-5">
                                <div className="flex flex-wrap gap-3.5">
                                    {tabs.map(tab => (
                                        <Button
                                            key={tab.id}
                                            variant={activeTab === tab.id ? 'default' : 'outline'}
                                            onClick={() => setActiveTab(tab.id)}
                                            className="h-12"
                                        >
                                            {tab.label}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Info Section */}
                        <Card>
                            <CardHeader className="border-b">
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
                                                <SelectItem value="FOOTBALL">Bóng đá</SelectItem>
                                                <SelectItem value="BASKETBALL">Bóng rổ</SelectItem>
                                                <SelectItem value="TENNIS">Tennis</SelectItem>
                                                <SelectItem value="BADMINTON">Cầu lông</SelectItem>
                                                <SelectItem value="VOLLEYBALL">Bóng chuyền</SelectItem>
                                                <SelectItem value="FUTSAL">Futsal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Venue Price Section */}
                        <Card>
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Giá sân</CardTitle>
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
                                            placeholder="60" 
                                            type="number" 
                                            value={formData.slotDuration}
                                            onChange={(e) => handleInputChange('slotDuration', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label>Slot tối thiểu</Label>
                                        <Input 
                                            placeholder="1" 
                                            type="number" 
                                            value={formData.minSlots}
                                            onChange={(e) => handleInputChange('minSlots', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-lg font-semibold">Khung giờ giá</Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={addPriceRange}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Thêm khung giờ
                                        </Button>
                                    </div>
                                    
                                    {formData.priceRanges.map((range, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                            <div className="space-y-2">
                                                <Label>Giờ bắt đầu</Label>
                                                <Input 
                                                    type="time"
                                                    value={range.start}
                                                    onChange={(e) => handlePriceRangeChange(index, 'start', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giờ kết thúc</Label>
                                                <Input 
                                                    type="time"
                                                    value={range.end}
                                                    onChange={(e) => handlePriceRangeChange(index, 'end', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Hệ số giá</Label>
                                                <Input 
                                                    type="number"
                                                    step="0.1"
                                                    value={range.multiplier}
                                                    onChange={(e) => handlePriceRangeChange(index, 'multiplier', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Thao tác</Label>
                                                <Button 
                                                    type="button"
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => removePriceRange(index)}
                                                    disabled={formData.priceRanges.length <= 1}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Availability Section */}
                        <Card>
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Lịch trống</CardTitle>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2.5">
                                    <h3 className="text-xl font-semibold">Giờ hoạt động</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label>Giờ mở cửa</Label>
                                            <Input 
                                                type="time"
                                                value={formData.operatingHours.start}
                                                onChange={(e) => handleOperatingHoursChange('start', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label>Giờ đóng cửa</Label>
                                            <Input 
                                                type="time"
                                                value={formData.operatingHours.end}
                                                onChange={(e) => handleOperatingHoursChange('end', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <h3 className="text-xl font-semibold">Slot tối đa</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label>Slot tối đa mỗi lần đặt</Label>
                                            <Input 
                                                placeholder="4" 
                                                type="number" 
                                                value={formData.maxSlots}
                                                onChange={(e) => handleInputChange('maxSlots', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Venue Overview Section */}
                        <Card>
                            <CardHeader className="border-b">
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
                        <Card>
                            <CardHeader className="border-b">
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
                        <Card>
                            <CardHeader className="border-b">
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
                        <Card>
                            <CardHeader className="border-b">
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
                        <Card>
                            <CardHeader className="border-b">
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
                        <Card>
                            <CardHeader className="border-b">
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