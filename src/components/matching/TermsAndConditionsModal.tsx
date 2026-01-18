import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, HeartHandshake, UserCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TermsAndConditionsModalProps {
    isOpen: boolean;
    onAgree: () => void;
    onDecline: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
    isOpen,
    onAgree,
    onDecline
}) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-2xl border-none">
                <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-black">Quy Định & Điều Khoản Matching</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Vui lòng đọc và đồng ý với các quy định dưới đây để tham gia tính năng tìm người chơi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    1. Xác thực tài khoản
                                </h4>
                                <p>
                                    Để đảm bảo an toàn cho cộng đồng, tất cả người dùng tham gia Matching bắt buộc phải sử dụng thông tin thật.
                                    Hồ sơ của bạn (ảnh đại diện, tên, tuổi) sẽ được hiển thị cho những người dùng khác trong khu vực.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <HeartHandshake className="w-4 h-4 text-primary" />
                                    2. Tôn trọng và Văn minh
                                </h4>
                                <p>
                                    Chúng tôi đề cao tinh thần thể thao cao thượng. Mọi hành vi quấy rối, lăng mạ, phân biệt đối xử hoặc
                                    sử dụng ngôn từ không phù hợp đều bị nghiêm cấm. Vi phạm sẽ dẫn đến việc khóa tài khoản vĩnh viễn.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-primary" />
                                    3. An toàn cá nhân
                                </h4>
                                <p>
                                    Mặc dù chúng tôi xác thực người dùng, nhưng bạn cần tự chịu trách nhiệm về sự an toàn của mình:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                    <li>Nên hẹn gặp ở các sân thể thao công cộng, đông người.</li>
                                    <li>Không chia sẻ thông tin tài chính hoặc cá nhân quá nhạy cảm.</li>
                                    <li>Báo cáo ngay cho hệ thống nếu phát hiện hành vi đáng ngờ.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900">4. Cam kết khi hẹn lịch</h4>
                                <p>
                                    Khi đã xác nhận "Hẹn giờ chơi", bạn cần có trách nhiệm đến đúng giờ. Nếu hủy kèo không lý do chính đáng
                                    quá 3 lần, tính năng Matching của bạn sẽ bị tạm khóa.
                                </p>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs">
                                <strong>Lưu ý:</strong> Chúng tôi có quyền từ chối hoặc xóa hồ sơ nếu phát hiện vi phạm các điều khoản trên mà không cần báo trước.
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                        <div className="flex items-center space-x-2 mb-6">
                            <Checkbox
                                id="terms"
                                checked={agreed}
                                onCheckedChange={(c) => setAgreed(c === true)}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                            >
                                Tôi đã đọc và đồng ý với các quy định trên
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={onDecline} className="flex-1 font-bold">
                                Để sau
                            </Button>
                            <Button
                                onClick={onAgree}
                                disabled={!agreed}
                                className="flex-1 font-bold bg-primary text-white shadow-lg shadow-primary/25"
                            >
                                Tạo Hồ Sơ Ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
