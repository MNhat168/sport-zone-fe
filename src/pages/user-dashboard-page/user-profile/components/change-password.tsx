import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { changePassword } from "@/features/user/userThunk"
import { clearError, clearSuccessStates } from "@/features/user/userSlice"
import { toast } from "sonner"

export default function ChangePassword() {
    const dispatch = useAppDispatch()
    const { 
        changePasswordLoading, 
        changePasswordSuccess, 
        changePasswordError 
    } = useAppSelector((state) => state.user)

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

    // Handle success
    useEffect(() => {
        if (changePasswordSuccess) {
            toast.success("Password changed successfully!")
            handleReset()
            dispatch(clearSuccessStates())
        }
    }, [changePasswordSuccess, dispatch])

    // Handle error
    useEffect(() => {
        if (changePasswordError) {
            toast.error(changePasswordError.message || "Failed to change password")
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
            errors.oldPassword = "Old password is required"
        }

        if (!formData.newPassword) {
            errors.newPassword = "New password is required"
        } else if (formData.newPassword.length < 6) {
            errors.newPassword = "New password must be at least 6 characters"
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Confirm password is required"
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match"
        }

        if (formData.oldPassword === formData.newPassword && formData.oldPassword) {
            errors.newPassword = "New password must be different from old password"
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
                old_password: formData.oldPassword,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword,
            })).unwrap()
        } catch (error) {
            // Error is handled by useEffect
        }
    }

    // Handle reset form
    const handleReset = () => {
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
    return (
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            Old Password
                        </Label>
                        <Input
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                            placeholder="Enter Old Password"
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] ${
                                validationErrors.oldPassword ? 'border-red-500 border' : ''
                            }`}
                        />
                        {validationErrors.oldPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.oldPassword}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            New Password
                        </Label>
                        <Input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            placeholder="Enter New Password"
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] ${
                                validationErrors.newPassword ? 'border-red-500 border' : ''
                            }`}
                        />
                        {validationErrors.newPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.newPassword}</p>
                        )}
                    </div>
                    
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal text-start">
                            Confirm Password
                        </Label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Enter Confirm Password"
                            className={`h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] ${
                                validationErrors.confirmPassword ? 'border-red-500 border' : ''
                            }`}
                        />
                        {validationErrors.confirmPassword && (
                            <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={changePasswordLoading}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={changePasswordLoading}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium"
                        >
                            {changePasswordLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}