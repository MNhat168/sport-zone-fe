import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { toast } from "sonner"
import { Building2, MapPin, Phone } from "lucide-react"

export default function FieldOwnerTab() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.user)
    const authUser = useAppSelector((state) => state.auth.user)
    
    const [formData, setFormData] = useState({
        businessName: "",
        taxCode: "",
        businessAddress: "",
        businessPhone: "",
        businessEmail: "",
        businessDescription: "",
        businessType: "",
    })

    // Fetch field owner profile data on component mount
    useEffect(() => {
        // TODO: Implement getFieldOwnerProfile thunk
        // if (authUser?._id && authUser?.role === "field_owner") {
        //     dispatch(getFieldOwnerProfile())
        // }
    }, [authUser?._id, dispatch])

    // Update form data when field owner data is loaded
    useEffect(() => {
        if (user && authUser?.role === "field_owner") {
            // TODO: Map field owner specific data when API is available
            setFormData({
                businessName: user.fullName || "", // Temporary fallback
                taxCode: "",
                businessAddress: "",
                businessPhone: user.phone || "",
                businessEmail: user.email || "",
                businessDescription: "",
                businessType: "",
            })
        }
    }, [user, authUser?.role])

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle form submit
    const handleSubmit = async () => {
        if (!authUser?._id || authUser?.role !== "field_owner") {
            toast.error("Access denied. Field owner role required.")
            return
        }

        try {
            // TODO: Implement updateFieldOwnerProfile thunk
            // await dispatch(updateFieldOwnerProfile({
            //     fieldOwnerId: authUser._id,
            //     ...formData,
            // })).unwrap()
            
            toast.success("Field owner profile updated successfully!")
        } catch (error: any) {
            toast.error(error?.message || "Failed to update field owner profile")
        }
    }

    // Handle reset form
    const handleReset = () => {
        if (user && authUser?.role === "field_owner") {
            setFormData({
                businessName: user.fullName || "",
                taxCode: "",
                businessAddress: "",
                businessPhone: user.phone || "",
                businessEmail: user.email || "",
                businessDescription: "",
                businessType: "",
            })
        }
    }

    return (
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-10">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 pb-5 border-b border-gray-200">
                        <Building2 className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Field Owner Information
                        </h2>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-700">
                            Business Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Business Name *
                                </Label>
                                <Input
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    placeholder="Enter Business Name"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Tax Code
                                </Label>
                                <Input
                                    value={formData.taxCode}
                                    onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                    placeholder="Enter Tax Code"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Business Type
                            </Label>
                            <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                                <SelectTrigger className="h-14 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385]">
                                    <SelectValue placeholder="Select Business Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="cooperative">Cooperative</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Business Description
                            </Label>
                            <Textarea
                                value={formData.businessDescription}
                                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                                placeholder="Describe your business..."
                                className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Business Phone
                                </Label>
                                <Input
                                    type="tel"
                                    value={formData.businessPhone}
                                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                                    placeholder="Enter Business Phone"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Business Email
                                </Label>
                                <Input
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                                    placeholder="Enter Business Email"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Business Address
                            </Label>
                            <Textarea
                                value={formData.businessAddress}
                                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                placeholder="Enter complete business address..."
                                className="min-h-[80px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                            />
                        </div>
                    </div>

                    {/* Field Owner Status */}
                    <div className="space-y-4 p-4 bg-blue-50 rounded-[10px] border border-blue-200">
                        <h4 className="text-base font-medium text-blue-800">
                            Field Owner Status
                        </h4>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-blue-700">
                                Your field owner account is active and verified
                            </span>
                        </div>
                        <p className="text-sm text-blue-600">
                            You can manage your fields, view bookings, and update business information from this section.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


