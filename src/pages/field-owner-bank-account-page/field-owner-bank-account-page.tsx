import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { addBankAccount, getMyBankAccounts, validateBankAccount } from '@/features/bank-account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSuccessToast, CustomFailedToast } from '@/components/toast/notificiation-toast';
import { FieldOwnerDashboardLayout } from '@/components/layouts/field-owner-dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function FieldOwnerBankAccountPage() {
    const dispatch = useAppDispatch();
    const { accounts, validationResult, adding, validating, loading } = useAppSelector((state) => state.bankAccount);

    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankCode: '',
        bankName: '',
        branch: '',
        verificationDocument: '',
    });

    useEffect(() => {
        dispatch(getMyBankAccounts());
    }, [dispatch]);

    const handleValidate = async () => {
        if (!formData.bankCode || !formData.accountNumber) {
            CustomFailedToast('Vui lòng nhập mã ngân hàng và số tài khoản');
            return;
        }

        try {
            await dispatch(validateBankAccount({
                bankCode: formData.bankCode,
                accountNumber: formData.accountNumber,
            })).unwrap();
        } catch (error: any) {
            CustomFailedToast(error.message || 'Xác thực thất bại');
        }
    };

    const handleSubmit = async () => {
        if (!formData.accountName || !formData.accountNumber || !formData.bankCode || !formData.bankName) {
            CustomFailedToast('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            await dispatch(addBankAccount(formData)).unwrap();
            CustomSuccessToast('Khai báo tài khoản thành công! Đang chờ xét duyệt.');
            setFormData({
                accountName: '',
                accountNumber: '',
                bankCode: '',
                bankName: '',
                branch: '',
                verificationDocument: '',
            });
            dispatch(getMyBankAccounts());
        } catch (error: any) {
            CustomFailedToast(error.message || 'Khai báo thất bại');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Đã xác minh</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Đang chờ</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <FieldOwnerDashboardLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Quản lý tài khoản ngân hàng</h1>

                {/* Add Bank Account Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thêm tài khoản ngân hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Tên chủ tài khoản (phải trùng với CCCD)</Label>
                            <Input
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                placeholder="NGUYEN VAN A"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Số tài khoản</Label>
                                <Input
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Mã ngân hàng</Label>
                                <Input
                                    value={formData.bankCode}
                                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                                    placeholder="VCB, TCB, BIDV..."
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Tên ngân hàng</Label>
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Chi nhánh (tùy chọn)</Label>
                            <Input
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Ảnh chụp màn hình Internet Banking (URL, tùy chọn)</Label>
                            <Input
                                value={formData.verificationDocument}
                                onChange={(e) => setFormData({ ...formData, verificationDocument: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        {validationResult && (
                            <div className={`p-3 rounded ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className={validationResult.isValid ? 'text-green-700' : 'text-red-700'}>
                                    {validationResult.isValid
                                        ? `✓ Tài khoản hợp lệ. Tên chủ TK: ${validationResult.accountName}`
                                        : '✗ Tài khoản không hợp lệ'}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleValidate}
                                disabled={validating || !formData.bankCode || !formData.accountNumber}
                            >
                                {validating ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={adding || !validationResult?.isValid}
                            >
                                {adding ? 'Đang gửi...' : 'Thêm tài khoản'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Accounts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tài khoản đã khai báo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : accounts.length === 0 ? (
                            <p className="text-gray-500">Chưa có tài khoản nào</p>
                        ) : (
                            <div className="space-y-4">
                                {accounts.map((account) => (
                                    <div key={account.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold">{account.accountName}</p>
                                                <p className="text-sm text-gray-600">{account.bankName} - {account.accountNumber}</p>
                                            </div>
                                            {getStatusBadge(account.status)}
                                        </div>
                                        {account.rejectionReason && (
                                            <p className="text-sm text-red-600 mt-2">Lý do: {account.rejectionReason}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </FieldOwnerDashboardLayout>
    );
}

