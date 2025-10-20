import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, User as  Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getUserProfile, updateUserProfile } from "@/features/user/userThunk"
import { toast } from "sonner"

export default function Profile() {
    const dispatch = useAppDispatch()
    const { user, loading, updateLoading, updateError } = useAppSelector((state) => state.user)
    const authUser = useAppSelector((state) => state.auth.user)
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    })
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch profile on component mount
    useEffect(() => {
        if (authUser?._id) {
            dispatch(getUserProfile())
        }
    }, [authUser?._id, dispatch])

    // Update form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
            })
            setAvatarPreview(user.avatarUrl || "")
        }
    }, [user])

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
                toast.error("Please select an image file")
                return
            }
            
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
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
            toast.error("User not authenticated")
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

            toast.success("Profile updated successfully!")
            setSelectedAvatar(null)
        } catch {
            toast.error(updateError?.message || "Failed to update profile")
        }
    }

    // Handle reset form
    const handleReset = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
            })
            setAvatarPreview(user.avatarUrl || "")
            setSelectedAvatar(null)
        }
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
                                    alt="Avatar preview" 
                                    className="w-full h-full object-cover rounded-[5px]"
                                />
                            ) : (
                                <>
                                    <div className="w-10 h-10 flex justify-center items-center">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <Label className="text-sm font-normal text-[#6B7385] cursor-pointer">
                                        Upload Photo
                                    </Label>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                className="hidden"
                            />
                            <Button
                                size="sm"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute top-3 right-3 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full p-0 text-white"
                            >
                                +
                            </Button>
                        </div>
                        <p className="text-sm font-normal text-[#6B7385]">
                            Upload a photo with a minimum size of 150 * 150 pixels (JPG, PNG, SVG).
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Name
                            </Label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Enter Name"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
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
                                placeholder="Enter Email Address"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                disabled
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Phone Number
                            </Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter Phone Number"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-5 pb-5 border-b border-gray-200">
                        <Label className="text-base font-normal  text-start">
                            Information about You
                        </Label>
                        <Textarea
                            placeholder="About"
                            className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                        />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold  text-start">
                            Address
                        </h3>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Address
                            </Label>
                            <Input
                                placeholder="Enter Address"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    State
                                </Label>
                                <Input
                                    placeholder="Enter State"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    City
                                </Label>
                                <Input
                                    placeholder="Enter City"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    Country
                                </Label>
                                <Select>
                                    <SelectTrigger className="h-14 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385]">
                                        <SelectValue placeholder="Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us">United States</SelectItem>
                                        <SelectItem value="vn">Vietnam</SelectItem>
                                        <SelectItem value="uk">United Kingdom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full md:w-96 space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Zipcode
                            </Label>
                            <Input
                                placeholder="Enter Zipcode"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={updateLoading}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={updateLoading}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium"
                        >
                            {updateLoading ? (
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


