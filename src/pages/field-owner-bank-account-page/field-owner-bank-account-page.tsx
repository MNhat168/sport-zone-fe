import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { addBankAccount, getMyBankAccounts, validateBankAccount } from '@/features/bank-account';
import { uploadRegistrationDocument } from '@/features/field-owner-registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomSuccessToast, CustomFailedToast } from '@/components/toast/notificiation-toast';
import { FieldOwnerDashboardLayout } from '@/components/layouts/field-owner-dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

export default function FieldOwnerBankAccountPage() {
    const dispatch = useAppDispatch();
    const { accounts, validationResult, adding, validating, loading } = useAppSelector((state) => state.bankAccount);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankCode: '',
        bankName: '',
        branch: '',
        verificationDocument: '',
    });

    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isValidImage = file.type.startsWith('image/');
        const isValidPdf = file.type === 'application/pdf';
        
        if (!isValidImage && !isValidPdf) {
            CustomFailedToast('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            CustomFailedToast('File không được vượt quá 5MB');
            return;
        }

        setVerificationFile(file);

        // Create preview for images
        if (isValidImage) {
            const preview = URL.createObjectURL(file);
            setFilePreview(preview);
        } else {
            setFilePreview(file.name);
        }
    };

    const handleRemoveFile = () => {
        if (filePreview && filePreview.startsWith('blob:')) {
            URL.revokeObjectURL(filePreview);
        }
        setVerificationFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFormData({ ...formData, verificationDocument: '' });
    };

    const handleSubmit = async () => {
        if (!formData.accountName || !formData.accountNumber || !formData.bankCode || !formData.bankName) {
            CustomFailedToast('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            let verificationDocumentUrl = formData.verificationDocument;

            // Upload file if provided
            if (verificationFile) {
                setUploading(true);
                try {
                    verificationDocumentUrl = await dispatch(uploadRegistrationDocument(verificationFile)).unwrap();
                    CustomSuccessToast('Tải lên ảnh thành công');
                } catch (uploadError: any) {
                    CustomFailedToast(uploadError.message || 'Lỗi khi tải lên ảnh');
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            await dispatch(addBankAccount({
                ...formData,
                verificationDocument: verificationDocumentUrl,
            })).unwrap();
            CustomSuccessToast('Khai báo tài khoản thành công! Đang chờ xét duyệt.');
            setFormData({
                accountName: '',
                accountNumber: '',
                bankCode: '',
                bankName: '',
                branch: '',
                verificationDocument: '',
            });
            handleRemoveFile();
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
                        <div className="space-y-2.5">
                            <Label>Tên chủ tài khoản (phải trùng với CCCD)</Label>
                            <Input
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                placeholder="NGUYEN VAN A"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label>Số tài khoản</Label>
                                <Input
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label>Mã ngân hàng</Label>
                                <Input
                                    value={formData.bankCode}
                                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                                    placeholder="VCB, TCB, BIDV..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label>Tên ngân hàng</Label>
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label>Chi nhánh (tùy chọn)</Label>
                            <Input
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label>Ảnh chụp màn hình Internet Banking (tùy chọn)</Label>
                            <div className="space-y-2">
                                {!filePreview ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileSelect}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Chấp nhận: JPG, PNG, PDF (tối đa 5MB)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                                        {filePreview.startsWith('blob:') ? (
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="h-20 w-20 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded">
                                                <span className="text-xs text-center px-2">{filePreview}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{verificationFile?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(verificationFile?.size || 0) / 1024 / 1024} MB
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveFile}
                                            disabled={uploading}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                                disabled={adding || uploading || !validationResult?.isValid}
                            >
                                {uploading ? 'Đang tải lên...' : adding ? 'Đang gửi...' : 'Thêm tài khoản'}
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