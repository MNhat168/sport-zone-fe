import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getMyRegistrationStatus } from '@/features/field-owner-registration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageModal } from '@/components/ui/image-modal';
import { NavbarDarkComponent } from '@/components/header/navbar-dark-component';
import { PageWrapper } from '@/components/layouts/page-wrapper';
import PageHeader from '@/components/header-banner/page-header';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Building2,
    FileText,
    Calendar,
    Phone,
    Globe,
    Clock as ClockIcon,
    MapPin,
    Image as ImageIcon,
    Shield,
    ExternalLink,
} from 'lucide-react';

export default function FieldOwnerRegistrationStatusPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentRequest, loading } = useAppSelector((state) => state.registration);
    const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [isFieldImagesModalOpen, setIsFieldImagesModalOpen] = useState(false);
    const [isBusinessLicenseModalOpen, setIsBusinessLicenseModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getMyRegistrationStatus());
    }, [dispatch]);


    if (loading) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader title="Trạng thái đăng ký" />
                    <div className="max-w-4xl mx-auto p-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center">Đang tải...</p>
                            </CardContent>
                        </Card>
                    </div>
                </PageWrapper>
            </>
        );
    }

    if (!currentRequest) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader title="Trạng thái đăng ký" />
                    <div className="max-w-4xl mx-auto p-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center mb-4">Bạn chưa có đơn đăng ký nào.</p>
                                <Button onClick={() => navigate('/become-field-owner')} className="w-full">
                                    Đăng ký làm chủ sân
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </PageWrapper>
            </>
        );
    }

    const getStatusIcon = () => {
        switch (currentRequest.status) {
            case 'approved':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-8 h-8 text-red-500" />;
            case 'pending':
                return <Clock className="w-8 h-8 text-yellow-500" />;
            default:
                return <AlertCircle className="w-8 h-8 text-gray-500" />;
        }
    };

    const getStatusBadge = () => {
        switch (currentRequest.status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã được duyệt</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bị từ chối</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Đang chờ xét duyệt</Badge>;
            default:
                return <Badge variant="secondary">Không xác định</Badge>;
        }
    };

    const getEkycStatusBadge = () => {
        if (!currentRequest.ekycStatus) return null;
        switch (currentRequest.ekycStatus) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã xác thực</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Xác thực thất bại</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Đang xác thực</Badge>;
            default:
                return null;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa có';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getOwnerTypeText = (type?: string) => {
        switch (type) {
            case 'individual':
                return 'Cá nhân';
            case 'business':
                return 'Doanh nghiệp';
            case 'household':
                return 'Hộ kinh doanh';
            default:
                return 'Không xác định';
        }
    };

    const getNextSteps = () => {
        switch (currentRequest.status) {
            case 'approved':
                return (
                    <div className="space-y-3">
                        <p className="font-semibold text-lg">Bước tiếp theo:</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Đăng nhập lại để kích hoạt tài khoản chủ sân</li>
                            <li>Khai báo tài khoản ngân hàng để nhận thanh toán</li>
                            <li>Tạo sân bóng đầu tiên của bạn</li>
                        </ol>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button onClick={() => navigate('/field-owner/bank-accounts')}>
                                Khai báo tài khoản ngân hàng
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/field/create')}>
                                Tạo sân bóng
                            </Button>
                        </div>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="space-y-3">
                        <p className="font-semibold text-red-600 text-lg">Lý do từ chối:</p>
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-sm text-red-800">
                                {currentRequest.rejectionReason || 'Không có lý do cụ thể'}
                            </p>
                        </div>
                        <Button onClick={() => navigate('/become-field-owner')} className="mt-4">
                            Đăng ký lại
                        </Button>
                    </div>
                );
            case 'pending':
                return (
                    <div className="space-y-2">
                        <p className="text-sm">
                            Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ phản hồi trong vòng 1-3 ngày làm việc.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader title="Trạng thái đăng ký" />
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    {/* Status Header Card */}
                    <Card className="shadow-lg border-2">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon()}
                                    <div>
                                        <CardTitle className="text-2xl mb-2">Trạng thái đăng ký</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge()}
                                            {currentRequest.ownerType && (
                                                <Badge variant="outline">
                                                    {getOwnerTypeText(currentRequest.ownerType)}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Ngày gửi đơn</p>
                                    <p className="font-semibold">{formatDate(currentRequest.submittedAt)}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {getNextSteps()}
                        </CardContent>
                    </Card>

                    {/* Personal Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Thông tin cá nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                                    <p className="font-medium">
                                        {currentRequest.personalInfo?.fullName || 'Không có thông tin'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Số CMND/CCCD</p>
                                    <p className="font-medium">
                                        {currentRequest.personalInfo?.idNumber || 'Không có thông tin'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Địa chỉ thường trú</p>
                                    <p className="font-medium">
                                        {currentRequest.personalInfo?.address || 'Không có thông tin'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Facility Information Section */}
                    {(currentRequest.facilityName ||
                        currentRequest.facilityLocation ||
                        currentRequest.description ||
                        currentRequest.contactPhone) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Thông tin cơ sở vật chất
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentRequest.facilityName && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Tên cơ sở</p>
                                            <p className="font-medium">{currentRequest.facilityName}</p>
                                        </div>
                                    )}
                                    {currentRequest.facilityLocation && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Địa điểm
                                            </p>
                                            <p className="font-medium">{currentRequest.facilityLocation}</p>
                                        </div>
                                    )}
                                    {currentRequest.contactPhone && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                Số điện thoại
                                            </p>
                                            <p className="font-medium">{currentRequest.contactPhone}</p>
                                        </div>
                                    )}
                                    {currentRequest.website && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                <Globe className="w-4 h-4" />
                                                Website
                                            </p>
                                            <a
                                                href={currentRequest.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                {currentRequest.website}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                    {currentRequest.businessHours && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                                <ClockIcon className="w-4 h-4" />
                                                Giờ hoạt động
                                            </p>
                                            <p className="font-medium">{currentRequest.businessHours}</p>
                                        </div>
                                    )}
                                </div>
                                {currentRequest.description && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                                        <p className="text-sm">{currentRequest.description}</p>
                                    </div>
                                )}
                                {currentRequest.supportedSports && currentRequest.supportedSports.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Môn thể thao hỗ trợ</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentRequest.supportedSports.map((sport, index) => (
                                                <Badge key={index} variant="outline">
                                                    {sport}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {currentRequest.amenities && currentRequest.amenities.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Tiện ích</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentRequest.amenities.map((amenity, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents & Verification Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Tài liệu & Xác thực
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* eKYC Status */}
                            {currentRequest.ekycStatus && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Trạng thái eKYC
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {getEkycStatusBadge()}
                                        {currentRequest.ekycVerifiedAt && (
                                            <span className="text-xs text-gray-500">
                                                Xác thực lúc: {formatDate(currentRequest.ekycVerifiedAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <hr className="my-4"/>
                            {/* Business License */}
                            {currentRequest.documents?.businessLicense && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Giấy ĐKKD
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors cursor-pointer group max-w-xs"
                                            onClick={() => setIsBusinessLicenseModalOpen(true)}
                                        >
                                            <img
                                                src={currentRequest.documents.businessLicense}
                                                alt="Giấy ĐKKD"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.error-placeholder')) {
                                                        const placeholder = document.createElement('div');
                                                        placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gray-100';
                                                        placeholder.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
                                                        parent.appendChild(placeholder);
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ImageIcon className="w-6 h-6 text-white drop-shadow-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <hr className="my-4"/>
                            {/* Field Images Gallery */}
                            {currentRequest.fieldImages && currentRequest.fieldImages.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Ảnh sân ({currentRequest.fieldImages.length} ảnh)
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {currentRequest.fieldImages.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedImageIndex(index);
                                                    setIsFieldImagesModalOpen(true);
                                                }}
                                            >
                                                {!imageError[index] ? (
                                                    <>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Ảnh sân ${index + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ImageIcon className="w-6 h-6 text-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Lịch sử xử lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="font-semibold text-sm">Đã gửi đơn</p>
                                        <p className="text-xs text-gray-600">{formatDate(currentRequest.submittedAt)}</p>
                                    </div>
                                </div>
                                {currentRequest.reviewedAt && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-semibold text-sm">Đã xem xét</p>
                                            <p className="text-xs text-gray-600">{formatDate(currentRequest.reviewedAt)}</p>
                                            {currentRequest.reviewedBy && (
                                                <p className="text-xs text-gray-500 mt-1">Bởi: {currentRequest.reviewedBy}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {currentRequest.processedAt && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    currentRequest.status === 'approved'
                                                        ? 'bg-green-500'
                                                        : currentRequest.status === 'rejected'
                                                          ? 'bg-red-500'
                                                          : 'bg-yellow-500'
                                                }`}
                                            ></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">
                                                {currentRequest.status === 'approved'
                                                    ? 'Đã duyệt'
                                                    : currentRequest.status === 'rejected'
                                                      ? 'Đã từ chối'
                                                      : 'Đã xử lý'}
                                            </p>
                                            <p className="text-xs text-gray-600">{formatDate(currentRequest.processedAt)}</p>
                                            {currentRequest.processedBy && (
                                                <p className="text-xs text-gray-500 mt-1">Bởi: {currentRequest.processedBy}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Field Images Modal */}
                {currentRequest.fieldImages && currentRequest.fieldImages.length > 0 && (
                    <ImageModal
                        images={currentRequest.fieldImages}
                        currentIndex={selectedImageIndex}
                        isOpen={isFieldImagesModalOpen}
                        onOpenChange={setIsFieldImagesModalOpen}
                        title={`Ảnh sân ${selectedImageIndex + 1} / ${currentRequest.fieldImages.length}`}
                        altTextPrefix="Ảnh sân"
                        showNavigation={true}
                        showThumbnails={true}
                    />
                )}

                {/* Business License Modal */}
                {currentRequest.documents?.businessLicense && (
                    <ImageModal
                        images={[currentRequest.documents.businessLicense]}
                        currentIndex={0}
                        isOpen={isBusinessLicenseModalOpen}
                        onOpenChange={setIsBusinessLicenseModalOpen}
                        title="Giấy ĐKKD"
                        altTextPrefix="Giấy ĐKKD"
                        showNavigation={false}
                        showThumbnails={false}
                    />
                )}
            </PageWrapper>
        </>
    );
}
