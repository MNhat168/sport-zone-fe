import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import axiosInstance from '@/utils/axios/axiosPrivate';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import coachPolicyData from '@/components/mock-data/coach_policy.json';
import fieldOwnerPolicyData from '@/components/mock-data/field_owner_policy.json';
import { getUserProfile } from '@/features/user/userThunk';
import { FooterComponent } from '@/components/footer/footer-component';
import { Shield, CheckCircle2 } from 'lucide-react';

interface PolicyRule {
    id: string;
    topic: string;
    rules: string[];
}

interface PolicyData {
    role: string;
    description: string;
    policies: PolicyRule[];
}

const PolicyConfirmationPage = () => {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redirect if already read policy or not correct role
    useEffect(() => {
        if (!user) return; // Wait for user load

        const isPartner = user.role === 'coach' || user.role === 'field_owner';
        if (!isPartner) {
            navigate('/');
            return;
        }

        if (user.hasReadPolicy) {
            navigate(user.role === 'coach' ? '/coach/dashboard' : '/field-owner/dashboard');
        }
    }, [user, navigate]);

    const policyData: PolicyData = useMemo(() => {
        if (user?.role === 'coach') {
            return coachPolicyData as PolicyData;
        }
        return fieldOwnerPolicyData as PolicyData;
    }, [user?.role]);

    const handleConfirm = async () => {
        if (!agreed) return;
        setLoading(true);

        try {
            const endpoint = user?.role === 'coach'
                ? '/coaches/confirm-policy'
                : '/field-owner/confirm-policy';

            await axiosInstance.post(endpoint);
            toast.success('Đã xác nhận chính sách thành công');

            if (user?._id) {
                await dispatch(getUserProfile()).unwrap();
            }

            // Navigate to dashboard
            navigate(user?.role === 'coach' ? '/coach/dashboard' : '/field-owner/dashboard');
        } catch (error) {
            console.error('Failed to confirm policy:', error);
            toast.error('Có lỗi xảy ra khi xác nhận chính sách. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 md:py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Chào mừng đến với SportZone
                    </h1>
                    <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
                        {policyData.description}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Info Alert */}
                    <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-900 mb-2">
                                    Điều khoản & Chính sách Đối tác SportZone
                                </h3>
                                <p className="text-sm text-green-800 leading-relaxed">
                                    Vui lòng đọc kỹ và đồng ý với các điều khoản & chính sách dưới đây để kích hoạt tài khoản đối tác của bạn và bắt đầu cung cấp dịch vụ trên nền tảng SportZone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Policy Content Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                Nội dung chính sách
                            </h2>
                        </div>

                        <ScrollArea className="h-[500px] px-6 py-6">
                            <div className="space-y-8 pr-4">
                                {policyData.policies.map((section, index) => (
                                    <div key={section.id} className="group">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                {index + 1}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 pt-1">
                                                {section.topic}
                                            </h3>
                                        </div>
                                        <ul className="pl-11 space-y-3">
                                            {section.rules.map((rule, ruleIndex) => (
                                                <li key={ruleIndex} className="flex items-start gap-3 text-gray-700 leading-relaxed">
                                                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                                    <span>{rule}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Agreement Section */}
                        <div className="bg-gray-50 px-6 py-8 border-t space-y-6">
                            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                                <Checkbox
                                    id="terms"
                                    checked={agreed}
                                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                                    className="mt-1"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-relaxed cursor-pointer select-none"
                                >
                                    Tôi xác nhận rằng tôi đã đọc, hiểu rõ và đồng ý với toàn bộ các điều khoản & chính sách được nêu trên. Tôi cam kết tuân thủ các quy định này trong quá trình cung cấp dịch vụ trên nền tảng SportZone.
                                </label>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[300px] text-lg h-14 bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
                                    disabled={!agreed || loading}
                                    onClick={handleConfirm}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Xác nhận & Tiếp tục
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <FooterComponent />
        </div>
    );
};

export default PolicyConfirmationPage;
