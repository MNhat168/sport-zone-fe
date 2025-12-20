import React from 'react';
import type { CreateCoachRegistrationPayload } from '@/features/coach-registration';

interface ConfirmationStepProps {
    formData: CreateCoachRegistrationPayload;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Xác nhận thông tin</h2>
            <p className="text-gray-600">Vui lòng kiểm tra lại thông tin trước khi gửi</p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <InfoRow label="Họ tên" value={formData.personalInfo.fullName} />
                <InfoRow label="Số CMND/CCCD" value={formData.personalInfo.idNumber} />
                <InfoRow label="Địa chỉ" value={formData.personalInfo.address} />
                <InfoRow label="Môn thể thao" value={formData.sports?.join(', ')} />
                <InfoRow label="Chứng chỉ" value={formData.certification} />
                <InfoRow label="Giá tiền/giờ" value={`${formData.hourlyRate?.toLocaleString()} VND`} />
                <InfoRow label="Vị trí hoạt động" value={formData.locationAddress} />
                <InfoRow label="Giới thiệu" value={formData.bio} />
                <InfoRow label="Kinh nghiệm" value={formData.experience} />
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                    <strong>Lưu ý:</strong> Sau khi gửi, đơn đăng ký của bạn sẽ được xem xét trong vòng 1-3 ngày làm việc.
                    Bạn sẽ nhận được email thông báo kết quả.
                </p>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200">
        <span className="font-medium text-gray-700">{label}:</span>
        <span className="text-gray-900">{value || 'Chưa cung cấp'}</span>
    </div>
);

export default ConfirmationStep;
