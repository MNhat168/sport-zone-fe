import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, User as Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getUserProfile, updateUserProfile } from "@/features/user/userThunk"
import { toast } from "sonner"

export default function Profile() {
    const dispatch = useAppDispatch()
    const { loading, updateLoading, updateError } = useAppSelector((state) => state.auth)
    const authUser = useAppSelector((state) => state.auth.user)

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    })
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [isEditMode, setIsEditMode] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch profile on component mount
    useEffect(() => {
        if (authUser?._id) {
            dispatch(getUserProfile())
        }
    }, [authUser?._id, dispatch])

    // Update form data when user data is loaded
    useEffect(() => {
        if (authUser) {
            setFormData({
                fullName: authUser.fullName || "",
                email: authUser.email || "",
                phone: authUser.phone || "",
            })
            setAvatarPreview(authUser.avatarUrl || "")
        }
    }, [authUser])

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle avatar selection
    const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Vui lòng chọn file ảnh")
                return
            }

            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước file phải nhỏ hơn 5MB")
                return
            }

            setSelectedAvatar(file)
            const previewUrl = URL.createObjectURL(file)
            setAvatarPreview(previewUrl)
        }
    }

    // Handle form submit
    const handleSubmit = async () => {
        if (!authUser?._id) {
            toast.error("Người dùng chưa được xác thực")
            return
        }

        try {
            await dispatch(updateUserProfile({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                avatar: selectedAvatar || undefined,
            })).unwrap()

            // Refetch latest profile so UI updates without F5
            await dispatch(getUserProfile())

            toast.success("Cập nhật hồ sơ thành công!")
            setSelectedAvatar(null)
            setIsEditMode(false) // Exit edit mode after successful save
        } catch {
            toast.error(updateError?.message || "Cập nhật hồ sơ thất bại")
        }
    }

    // Handle toggle edit mode
    const handleToggleEdit = () => {
        if (isEditMode) {
            // Cancel edit mode - reset to original values
            if (authUser) {
                setFormData({
                    fullName: authUser.fullName || "",
                    email: authUser.email || "",
                    phone: authUser.phone || "",
                })
                setAvatarPreview(authUser.avatarUrl || "")
                setSelectedAvatar(null)
            }
        }
        setIsEditMode(!isEditMode)
    }

    if (loading) {
        return (
            <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
                <CardContent className="p-6 flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }
    return (

        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-10">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col gap-5">
                        <div className="relative w-44 h-40 p-5 bg-white rounded-[10px] border border-gray-300 flex flex-col justify-center items-center gap-2 overflow-hidden">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Xem trước ảnh đại diện"
                                    className="w-full h-full object-cover rounded-[5px]"
                                />
                            ) : (
                                <>
                                    <div className="w-10 h-10 flex justify-center items-center">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <Label className="text-sm font-normal text-[#6B7385] cursor-pointer">
                                        Tải ảnh lên
                                    </Label>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                disabled={!isEditMode}
                                className="hidden"
                            />
                            <Button
                                size="sm"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isEditMode}
                                className="absolute top-3 right-3 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full p-0 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </Button>
                        </div>
                        <p className="text-sm font-normal text-[#6B7385]">
                            Tải lên ảnh có kích thước tối thiểu 150 * 150 pixel (JPG, PNG, SVG).
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Tên
                            </Label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Nhập tên"
                                disabled={!isEditMode}
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Nhập địa chỉ email"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                disabled
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Số điện thoại
                            </Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Nhập số điện thoại"
                                disabled={!isEditMode}
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-5 pb-5 border-b border-gray-200">
                        <Label className="text-base font-normal  text-start">
                            Thông tin về bạn
                        </Label>
                        <Textarea
                            placeholder="Giới thiệu"
                            disabled={!isEditMode}
                            className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold  text-start">
                            Địa chỉ
                        </h3>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Địa chỉ
                            </Label>
                            <Input
                                placeholder="Nhập địa chỉ"
                                disabled={!isEditMode}
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    Tỉnh/Thành phố
                                </Label>
                                <Input
                                    placeholder="Nhập tỉnh/thành phố"
                                    disabled={!isEditMode}
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    Thành phố
                                </Label>
                                <Input
                                    placeholder="Nhập thành phố"
                                    disabled={!isEditMode}
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    Quốc gia
                                </Label>
                                <Select disabled={!isEditMode}>
                                    <SelectTrigger className="h-14 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SelectValue placeholder="Quốc gia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us">Hoa Kỳ</SelectItem>
                                        <SelectItem value="vn">Việt Nam</SelectItem>
                                        <SelectItem value="uk">Vương quốc Anh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full md:w-96 space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Mã bưu điện
                            </Label>
                            <Input
                                placeholder="Nhập mã bưu điện"
                                disabled={!isEditMode}
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleToggleEdit}
                            disabled={updateLoading}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            {isEditMode ? "Hủy" : "Chỉnh sửa"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={updateLoading || !isEditMode}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


