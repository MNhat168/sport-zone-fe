import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getMyRegistrationStatus } from '@/features/field-owner-registration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavbarDarkComponent } from '@/components/header/navbar-dark-component';
import { PageWrapper } from '@/components/layouts/page-wrapper';
import PageHeader from '@/components/header-banner/page-header';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function FieldOwnerRegistrationStatusPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentRequest, loading } = useAppSelector((state) => state.registration);

    useEffect(() => {
        dispatch(getMyRegistrationStatus());
    }, [dispatch]);

    if (loading) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader title="Trạng thái đăng ký" />
                    <div className="max-w-2xl mx-auto p-6">
                        <p>Đang tải...</p>
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
                    <div className="max-w-2xl mx-auto p-6">
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
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-12 h-12 text-red-500" />;
            case 'pending':
                return <Clock className="w-12 h-12 text-yellow-500" />;
            default:
                return <AlertCircle className="w-12 h-12 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        switch (currentRequest.status) {
            case 'approved':
                return 'Đã được duyệt';
            case 'rejected':
                return 'Bị từ chối';
            case 'pending':
                return 'Đang chờ xét duyệt';
            default:
                return 'Không xác định';
        }
    };

    const getNextSteps = () => {
        switch (currentRequest.status) {
            case 'approved':
                return (
                    <div className="space-y-2">
                        <p className="font-semibold">Bước tiếp theo:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Đăng nhập lại để kích hoạt tài khoản chủ sân</li>
                            <li>Khai báo tài khoản ngân hàng để nhận thanh toán</li>
                            <li>Tạo sân bóng đầu tiên của bạn</li>
                        </ol>
                        <div className="mt-4 space-x-2">
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
                    <div className="space-y-2">
                        <p className="font-semibold text-red-600">Lý do từ chối:</p>
                        <p className="bg-red-50 p-3 rounded">{currentRequest.rejectionReason || 'Không có lý do cụ thể'}</p>
                        <Button onClick={() => navigate('/become-field-owner')} className="mt-4">
                            Đăng ký lại
                        </Button>
                    </div>
                );
            case 'pending':
                return (
                    <div className="space-y-2">
                        <p>Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ phản hồi trong vòng 1-3 ngày làm việc.</p>
                        <p className="text-sm text-gray-600">Ngày gửi: {new Date(currentRequest.submittedAt).toLocaleDateString('vi-VN')}</p>
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
                <div className="max-w-2xl mx-auto p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                {getStatusIcon()}
                                <span>Trạng thái: {getStatusText()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold">Thông tin đăng ký:</p>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>Loại hình: {currentRequest.ownerType === 'individual' ? 'Cá nhân' : currentRequest.ownerType === 'business' ? 'Doanh nghiệp' : 'Hộ kinh doanh'}</p>
                                    <p>Họ tên: {currentRequest.personalInfo?.fullName || 'Không có thông tin'}</p>
                                    <p>Địa chỉ: {currentRequest.personalInfo?.address || 'Không có thông tin'}</p>
                                </div>
                            </div>
                            {getNextSteps()}
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        </>
    );
}

