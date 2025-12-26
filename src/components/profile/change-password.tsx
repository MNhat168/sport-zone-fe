import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { changePassword, deactivateAccount } from "@/features/authentication/authThunk"
import { clearSuccessStates } from "@/features/authentication/authSlice"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"

export default function ChangePassword() {
    const dispatch = useAppDispatch()
    const {
        changePasswordLoading,
        changePasswordSuccess,
        changePasswordError,
        deactivateLoading
    } = useAppSelector((state) => state.auth)
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [validationErrors, setValidationErrors] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [isEditMode, setIsEditMode] = useState(false)

    // Handle success
    useEffect(() => {
        if (changePasswordSuccess) {
            toast.success("Đổi mật khẩu thành công!")
            setIsEditMode(false)
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setValidationErrors({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            dispatch(clearSuccessStates())
        }
    }, [changePasswordSuccess, dispatch])

    // Handle error
    useEffect(() => {
        if (changePasswordError) {
            toast.error(changePasswordError.message || "Đổi mật khẩu thất bại")
        }
    }, [changePasswordError])

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear validation error for the field being edited
        if (validationErrors[field as keyof typeof validationErrors]) {
            setValidationErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    // Validate form
    const validateForm = () => {
        const errors = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        }

        if (!formData.oldPassword) {
            errors.oldPassword = "Vui lòng nhập mật khẩu cũ"
        }

        if (!formData.newPassword) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới"
        } else if (formData.newPassword.length < 6) {
            errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu không khớp"
        }

        if (formData.oldPassword === formData.newPassword && formData.oldPassword) {
            errors.newPassword = "Mật khẩu mới phải khác mật khẩu cũ"
        }

        setValidationErrors(errors)
        return !Object.values(errors).some(error => error !== "")
    }

    // Handle form submit
    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        try {
            await dispatch(changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            })).unwrap()
        } catch {
            // Error is handled by useEffect
        }
    }

    // Handle toggle edit mode
    const handleToggleEdit = () => {
        if (isEditMode) {
            // Cancel edit mode - reset form
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setValidationErrors({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        }
        setIsEditMode(!isEditMode)
    }

    // Handle deactivate account
    const handleDeactivateAccount = async () => {
        try {
            await dispatch(deactivateAccount()).unwrap()
            toast.success("Tài khoản của bạn đã được vô hiệu hóa")
            navigate("/")
        } catch (error: any) {
            toast.error(error.message || "Vô hiệu hóa tài khoản thất bại")
        }
    }
    return (
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            Mật khẩu cũ
                        </Label>
                        <Input
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                            placeholder="Nhập mật khẩu cũ"
                            disabled={!isEditMode}
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed ${validationErrors.oldPassword ? 'border-red-500 border' : ''
                                }`}
                        />
                        {validationErrors.oldPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.oldPassword}</p>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            Mật khẩu mới
                        </Label>
                        <Input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            disabled={!isEditMode}
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed ${validationErrors.newPassword ? 'border-red-500 border' : ''
                                }`}
                        />
                        {validationErrors.newPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.newPassword}</p>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            Xác nhận mật khẩu
                        </Label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            disabled={!isEditMode}
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed ${validationErrors.confirmPassword ? 'border-red-500 border' : ''
                                }`}
                        />
                        {validationErrors.confirmPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Deactivate Account Section */}
                    <div className="space-y-2.5 pt-5 border-t border-gray-200">
                        <Label className="text-base font-normal text-start">
                            Vô hiệu hóa tài khoản
                        </Label>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={deactivateLoading}
                                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-[10px] text-base font-medium"
                                >
                                    {deactivateLoading ? <Loading size={16} className="mr-2" /> : null}
                                    Vô hiệu hóa tài khoản
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bạn có chắc chắn muốn vô hiệu hóa tài khoản?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Hành động này sẽ vô hiệu hóa tài khoản của bạn. Bạn sẽ không thể đăng nhập cho đến khi tài khoản được kích hoạt lại bởi quản trị viên.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeactivateAccount}
                                        className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                    >
                                        Vô hiệu hóa
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <p className="text-sm font-normal text-[#6B7385]">
                            Nhấn nút để vô hiệu hóa tài khoản
                        </p>
                    </div>

                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleToggleEdit}
                            disabled={changePasswordLoading}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            {isEditMode ? "Hủy" : "Chỉnh sửa"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={changePasswordLoading || !isEditMode}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {changePasswordLoading ? (
                                <Loading size={16} className="mr-2" />
                            ) : null}
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


