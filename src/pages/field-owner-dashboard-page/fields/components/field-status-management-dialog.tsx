import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hook";
import { updateField } from "@/features/field/fieldThunk";
import { getMyFields } from "@/features/field/fieldThunk";
import { CheckCircle2, XCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface FieldStatusManagementDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    fieldId: string;
    fieldName: string;
    currentStatus: boolean;
}

export const FieldStatusManagementDialog: React.FC<FieldStatusManagementDialogProps> = ({
    isOpen,
    onOpenChange,
    fieldId,
    fieldName,
    currentStatus,
}) => {
    const dispatch = useAppDispatch();
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusChange = async (newStatus: boolean) => {
        if (!fieldId) return;

        setIsUpdating(true);
        setError(null);
        setUpdateSuccess(false);

        try {
            await dispatch(
                updateField({
                    id: fieldId,
                    payload: { isActive: newStatus },
                })
            ).unwrap();

            setUpdateSuccess(true);

            // Refresh the fields list
            dispatch(getMyFields({ page: 1, limit: 10 }));

            // Close dialog after a short delay
            setTimeout(() => {
                onOpenChange(false);
                setUpdateSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err?.message || "Có lỗi xảy ra khi cập nhật trạng thái sân");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        if (!isUpdating) {
            onOpenChange(false);
            setError(null);
            setUpdateSuccess(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Quản lý trạng thái sân</DialogTitle>
                    <DialogDescription>
                        Quản lý trạng thái hoạt động của sân <strong>{fieldName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {updateSuccess ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                            <p className="text-lg font-semibold text-green-600">
                                Cập nhật trạng thái thành công!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        Trạng thái hiện tại:
                                    </span>
                                    <span
                                        className={`text-sm font-semibold px-3 py-1 rounded-full ${currentStatus
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {currentStatus ? "Đang hoạt động" : "Tạm dừng"}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">
                                    {currentStatus
                                        ? "Bạn có thể tạm dừng sân này để ngăn người dùng đặt chỗ."
                                        : "Bạn có thể kích hoạt sân này để cho phép người dùng đặt chỗ."}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleStatusChange(true)}
                                    disabled={isUpdating || currentStatus}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loading size={16} className="mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Kích hoạt"
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleStatusChange(false)}
                                    disabled={isUpdating || !currentStatus}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loading size={16} className="mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Tạm dừng"
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    {!updateSuccess && (
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUpdating}
                        >
                            Hủy
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

