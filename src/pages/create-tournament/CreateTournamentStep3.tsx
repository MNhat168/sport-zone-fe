import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Trophy,
  CheckCircle2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { createTournament } from '@/features/tournament/tournamentThunk';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface Step3Props {
  formData: any;
  onBack: () => void;
  onUpdate: (data: any) => void; // Add this prop
}

export default function CreateTournamentStep3({ formData, onBack, onUpdate }: Step3Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.tournament);
  const { availableFields } = useAppSelector((state) => state.tournament);
  const [success, setSuccess] = useState(false);
  const [isEditingFee, setIsEditingFee] = useState(false);

  const selectedFields = availableFields.filter(f => 
    formData.selectedFieldIds?.includes(f._id)
  );

  // Calculate recommended fees
  const calculateRecommendedFees = () => {
    const totalFieldCost = formData.totalFieldCost || 0;
    const minParticipants = formData.minParticipants || 1;
    const maxParticipants = formData.maxParticipants || 1;
    
    // Minimum fee to break even with minimum participants (including 10% commission)
    const breakEvenFee = Math.ceil((totalFieldCost / minParticipants) / 0.9);
    
    // Recommended fee to cover fields and have prize money
    const recommendedFee = Math.ceil(breakEvenFee * 1.3); // 30% above break-even
    
    // Premium fee for substantial prize pool
    const premiumFee = Math.ceil(breakEvenFee * 1.7);
    
    return {
      breakEvenFee,
      recommendedFee,
      premiumFee
    };
  };

  const recommendedFees = calculateRecommendedFees();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDeadline = () => {
    const tournamentDate = new Date(formData.tournamentDate);
    const deadline = new Date(tournamentDate.getTime() - 48 * 60 * 60 * 1000);
    return deadline.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFeeChange = (fee: number) => {
    onUpdate({ ...formData, registrationFee: fee });
  };

  const handleSubmit = async () => {
    try {
      const result = await dispatch(createTournament(formData)).unwrap();
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/tournaments/${result._id}`);
      }, 2000);
    } catch (err) {
      console.error('Failed to create tournament:', err);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center p-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tạo Giải Đấu Thành Công!</h2>
          <p className="text-gray-600 mb-4">
            Giải đấu của bạn đã được tạo và sân đã được đặt tạm thời.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển hướng...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Xác Nhận Thông Tin Giải Đấu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Fee Setting */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Thiết Lập Phí Đăng Ký
            </h3>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <Badge variant="outline" className="mb-2 bg-blue-100 text-blue-700">
                      Tối Thiểu
                    </Badge>
                    <p className="text-2xl font-bold text-blue-600">
                      {recommendedFees.breakEvenFee.toLocaleString()} VNĐ
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Đủ chi phí sân ({formData.minParticipants} người)
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => handleFeeChange(recommendedFees.breakEvenFee)}
                    >
                      Chọn
                    </Button>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-green-300">
                    <Badge variant="outline" className="mb-2 bg-green-100 text-green-700">
                      Đề Xuất
                    </Badge>
                    <p className="text-2xl font-bold text-green-600">
                      {recommendedFees.recommendedFee.toLocaleString()} VNĐ
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Chi phí sân + giải thưởng
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleFeeChange(recommendedFees.recommendedFee)}
                    >
                      Chọn
                    </Button>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <Badge variant="outline" className="mb-2 bg-purple-100 text-purple-700">
                      Cao Cấp
                    </Badge>
                    <p className="text-2xl font-bold text-purple-600">
                      {recommendedFees.premiumFee.toLocaleString()} VNĐ
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Giải thưởng hấp dẫn
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => handleFeeChange(recommendedFees.premiumFee)}
                    >
                      Chọn
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Phí Đăng Ký Tùy Chỉnh
                    </Label>
                    {!isEditingFee ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingFee(true)}
                      >
                        Tùy chỉnh
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Đang chỉnh sửa
                      </span>
                    )}
                  </div>
                  
                  {isEditingFee ? (
                    <div className="space-y-2">
                      <Input
                        type="number"
                        value={formData.registrationFee || 0}
                        onChange={(e) => handleFeeChange(Number(e.target.value))}
                        min={0}
                        className="border-2 border-blue-300"
                      />
                      <div className="flex justify-between text-sm">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsEditingFee(false)}
                        >
                          Hoàn tất
                        </Button>
                        {formData.registrationFee < recommendedFees.breakEvenFee && (
                          <span className="text-red-500 text-sm">
                            Cảnh báo: Phí có thể không đủ chi phí sân
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-semibold text-lg">
                        {formData.registrationFee?.toLocaleString() || 0} VNĐ
                      </span>
                      <Badge variant={
                        formData.registrationFee >= recommendedFees.recommendedFee ? "default" :
                        formData.registrationFee >= recommendedFees.breakEvenFee ? "outline" :
                        "destructive"
                      }>
                        {formData.registrationFee >= recommendedFees.recommendedFee ? "Tốt" :
                         formData.registrationFee >= recommendedFees.breakEvenFee ? "Đủ" :
                         "Thấp"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rest of the existing Step3 content remains the same */}
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông Tin Cơ Bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên Giải Đấu</Label>
                <p className="font-semibold text-lg">{formData.name}</p>
              </div>
              
              <div>
                <Label>Môn Thể Thao</Label>
                <Badge className="mt-1">{formData.sportType}</Badge>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa Điểm
              </Label>
              <p className="font-semibold">{formData.location}</p>
            </div>

            {/* Tournament Date */}
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày Diễn Ra Giải Đấu
              </Label>
              <p className="font-semibold">{formatDate(formData.tournamentDate)}</p>
            </div>

            {/* Registration Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Thời Gian Đăng Ký</Label>
                <p className="font-semibold">
                  {formatDate(formData.registrationStart)} - {formatDate(formData.registrationEnd)}
                </p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Thời Gian Thi Đấu
                </Label>
                <p className="font-semibold">{formData.startTime} - {formData.endTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Số Người Tham Gia
                </Label>
                <p className="font-semibold">
                  Tối thiểu: {formData.minParticipants} | Tối đa: {formData.maxParticipants}
                </p>
              </div>
            </div>

            <div>
              <Label>Mô Tả</Label>
              <p className="text-gray-700">{formData.description}</p>
            </div>
          </div>

          {/* Selected Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Sân Đã Chọn</h3>
            
            <div className="space-y-3">
              {selectedFields.map((field) => {
                const price = Number(field.basePrice) || 0;
                const start = new Date(`2000-01-01T${formData.startTime}`);
                const end = new Date(`2000-01-01T${formData.endTime}`);
                const durationMs = end.getTime() - start.getTime();
                const durationHours = Math.max(0, durationMs / 3600000);
                const total = Math.round(price * durationHours);

                return (
                  <Card key={field._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{field.name}</h4>
                        <p className="text-sm text-gray-600">{field.location?.address}</p>
                      </div>
                      <Badge variant="outline">
                        {total.toLocaleString()} VNĐ
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Financial Summary - Updated to use current registration fee */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Tóm Tắt Tài Chính</h3>
            
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Phí Đăng Ký / Người:</span>
                  <span className="font-semibold">
                    {(formData.registrationFee || 0).toLocaleString()} VNĐ
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tổng Chi Phí Sân:</span>
                  <span className="font-semibold text-red-600">
                    {formData.totalFieldCost.toLocaleString()} VNĐ
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Doanh Thu Tối Thiểu ({formData.minParticipants} người):</span>
                  <span className="font-semibold text-green-600">
                    {((formData.registrationFee || 0) * formData.minParticipants).toLocaleString()} VNĐ
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Doanh Thu Tối Đa ({formData.maxParticipants} người):</span>
                  <span className="font-semibold text-green-600">
                    {((formData.registrationFee || 0) * formData.maxParticipants).toLocaleString()} VNĐ
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Chênh Lệch (Tối Thiểu):</span>
                    <span className={
                      ((formData.registrationFee || 0) * formData.minParticipants - formData.totalFieldCost) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {(((formData.registrationFee || 0) * formData.minParticipants) - formData.totalFieldCost).toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý quan trọng:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Sân sẽ được đặt tạm thời và không bị tính phí ngay lập tức</li>
                <li>
                  Hạn chót xác nhận: <strong>{calculateDeadline()}</strong>
                </li>
                <li>
                  Cần tối thiểu <strong>{formData.minParticipants} người</strong> đăng ký trước hạn chót
                </li>
                <li>Nếu không đủ người, giải đấu sẽ tự động hủy và hoàn tiền cho người tham gia</li>
                <li>Phí hoa hồng 10% sẽ được tính trên tổng phí đăng ký</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={onBack} variant="outline" disabled={loading}>
              Quay Lại
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={loading || !formData.registrationFee || formData.registrationFee <= 0}
            >
              {loading ? 'Đang Tạo...' : 'Xác Nhận Tạo Giải Đấu'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Keep the existing Label component
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm text-gray-600 mb-1 ${className}`}>{children}</div>;
}