import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getMyCoachRegistration } from '@/features/coach-registration';
import { Loading } from "@/components/ui/loading";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import PageHeader from "@/components/header-banner/page-header"

const CoachRegistrationStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRequest, loading } = useAppSelector(state => state.coachRegistration);

  useEffect(() => {
    dispatch(getMyCoachRegistration());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <NavbarDarkComponent />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loading size={48} className="text-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="min-h-screen">
        <NavbarDarkComponent />
        <PageWrapper>
          <PageHeader
            title="Trạng thái đăng ký HLV"
            breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Trạng thái đăng ký" }]}
          />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Chưa có đơn đăng ký</h2>
              <p className="text-gray-600 mt-2">Bạn chưa gửi đơn đăng ký huấn luyện viên nào.</p>
              <button
                onClick={() => navigate('/become-coach')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </PageWrapper>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Đang chờ duyệt</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Đã phê duyệt</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Bị từ chối</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarDarkComponent />
      <PageWrapper>
        <PageHeader
          title="Trạng thái đăng ký HLV"
          breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Trạng thái đăng ký" }]}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Trạng thái đơn đăng ký</h1>
              {getStatusBadge(currentRequest.status)}
            </div>

            <div className="space-y-4">
              <InfoSection title="Thông tin cá nhân">
                <InfoRow label="Họ tên" value={currentRequest.personalInfo.fullName} />
                <InfoRow label="Số CMND/CCCD" value={currentRequest.personalInfo.idNumber} />
                <InfoRow label="Địa chỉ" value={currentRequest.personalInfo.address} />
              </InfoSection>

              <InfoSection title="Thông tin huấn luyện viên">
                <InfoRow label="Môn thể thao" value={currentRequest.sports?.join(', ')} />
                <InfoRow label="Chứng chỉ" value={currentRequest.certification} />
                <InfoRow label="Giá tiền/giờ" value={`${currentRequest.hourlyRate?.toLocaleString()} VND`} />
                <InfoRow label="Vị trí" value={currentRequest.locationAddress} />
              </InfoSection>

              <InfoSection title="Thông tin đơn">
                <InfoRow label="Ngày gửi" value={currentRequest.submittedAt ? new Date(currentRequest.submittedAt).toLocaleString('vi-VN') : ''} />
                {currentRequest.processedAt && (
                  <InfoRow label="Ngày xử lý" value={new Date(currentRequest.processedAt).toLocaleString('vi-VN')} />
                )}
                {currentRequest.rejectionReason && (
                  <InfoRow label="Lý do từ chối" value={currentRequest.rejectionReason} />
                )}
              </InfoSection>
            </div>

            {currentRequest.status === 'pending' && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-700">
                  Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả qua email trong vòng 1-3 ngày làm việc.
                </p>
              </div>
            )}

            {currentRequest.status === 'approved' && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-sm text-green-700">
                  Chúc mừng! Đơn đăng ký của bạn đã được phê duyệt. Bạn có thể bắt đầu sử dụng hệ thống ngay bây giờ.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-gray-900">{value || 'N/A'}</span>
  </div>
);

export default CoachRegistrationStatusPage;
