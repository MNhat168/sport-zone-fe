import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { toast } from "sonner"
import { Building2, MapPin, Phone } from "lucide-react"
import { SportType } from "@/components/enums/ENUMS"
import { 
    getMyOwnerProfile, 
    updateMyOwnerProfile, 
    createOwnerProfile 
} from "@/features/field-owner-profile"
import { BookingFilters } from "@/pages/field-owner-dashboard-page/field-booking-list-page/components/booking-filter"
import { BookingTable } from "@/pages/field-owner-dashboard-page/field-booking-list-page/components/booking-table"
import { BookingPagination } from "@/pages/field-owner-dashboard-page/field-booking-list-page/components/field-history-booking-page"
import { BookingHistoryTabs } from "@/components/tabs/field-history-booking-tab"
import CourtBookingDetails from "@/components/pop-up/court-booking-detail"

export default function FieldOwnerTab() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.user)
    const authUser = useAppSelector((state) => state.auth.user)
    const ownerProfileState = useAppSelector((state) => state.ownerProfile)
    const { myProfile, loading, creating, updating } = ownerProfileState
    
    const [formData, setFormData] = useState({
        facilityName: "",
        facilityLocation: "",
        supportedSports: [] as string[],
        description: "",
        businessHours: "",
        contactPhone: "",
        website: "",
        businessEmail: "",
    })
    const [isEditing, setIsEditing] = useState(false)
    
    // Booking list states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<any>(undefined)

    // Mock booking data
    const mockBookings = [
        {
            id: "1",
            academyName: "Bwing Sports Academy",
            courtName: "Sân 1",
            academyImage: "/images/academies/bwing.jpg",
            date: "Thứ Hai, 15 Tháng 7",
            time: "03:00 PM - 05:00 PM",
            payment: "$130",
            status: "awaiting" as const,
            statusText: "Chờ Xác Nhận",
        },
        {
            id: "2",
            academyName: "Feather Badminton",
            courtName: "Sân 1",
            academyImage: "/images/academies/feather.jpg",
            date: "Thứ Hai, 12 Tháng 7",
            time: "02:00 PM - 05:00 PM",
            payment: "$90",
            status: "awaiting" as const,
            statusText: "Chờ Xác Nhận",
        },
        {
            id: "3",
            academyName: "Leap Sports Academy",
            courtName: "Sân 1",
            academyImage: "/images/academies/leap.jpg",
            date: "Thứ Hai, 11 Tháng 7",
            time: "06:00 PM - 08:00 PM",
            payment: "$120",
            status: "accepted" as const,
            statusText: "Đã Chấp Nhận",
        },
    ]

    const sampleBookingData = {
        academy: "Wing Sports Academy",
        court: "Sân 1",
        bookedOn: "Thứ Hai, 14 Tháng 7",
        pricePerGuest: "$15",
        maxGuests: "2",
        bookingDate: "Thứ Hai, 14 Tháng 7",
        bookingTime: "05:00 PM - 08:00 PM",
        totalHours: "2",
        courtBookingAmount: "$150",
        additionalGuests: "2",
        additionalGuestsAmount: "$30",
        serviceCharge: "$20",
        totalAmountPaid: "$180",
        paidOn: "Thứ Hai, 14 Tháng 7",
        transactionId: "#5464164445676781641",
        paymentType: "Ví điện tử",
    }

    // Nhãn hiển thị tiếng Việt cho các môn thể thao
    const SPORT_LABELS: Record<string, string> = {
        [SportType.FOOTBALL]: "Bóng đá",
        [SportType.TENNIS]: "Quần vợt",
        [SportType.BADMINTON]: "Cầu lông",
        [SportType.PICKLEBALL]: "Pickleball",
        [SportType.BASKETBALL]: "Bóng rổ",
        [SportType.VOLLEYBALL]: "Bóng chuyền",
        [SportType.SWIMMING]: "Bơi lội",
        [SportType.GYM]: "Gym",
    }

    // Fetch field owner profile data on component mount
    useEffect(() => {
        if (authUser?._id && authUser?.role === "field_owner") {
            dispatch(getMyOwnerProfile())
        }
    }, [authUser?._id, dispatch])

    // Update form data when field owner data is loaded
    useEffect(() => {
        if (authUser?.role !== "field_owner") return

        // Prefer profile values, fall back to user for email/phone
        if (myProfile) {
            setFormData({
                facilityName: myProfile.facilityName || "",
                facilityLocation: myProfile.facilityLocation || "",
                supportedSports: myProfile.supportedSports || [],
                description: myProfile.description || "",
                businessHours: myProfile.businessHours || "",
                contactPhone: myProfile.contactPhone || user?.phone || "",
                website: myProfile.website || "",
                businessEmail: user?.email || "",
            })
            // Existing profile: default to view mode
            setIsEditing(false)
        } else if (user) {
            setFormData((prev) => ({
                ...prev,
                contactPhone: user.phone || "",
                businessEmail: user.email || "",
            }))
            // No profile yet: allow editing to create
            setIsEditing(true)
        }
    }, [myProfile, user, authUser?.role])

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle form submit
    const handleSubmit = async () => {
        if (!authUser?._id || authUser?.role !== "field_owner") {
            toast.error("Từ chối truy cập. Cần quyền chủ sân.")
            return
        }

        try {
            const payload = {
                facilityName: formData.facilityName,
                facilityLocation: formData.facilityLocation || undefined,
                supportedSports: formData.supportedSports.length ? formData.supportedSports : undefined,
                description: formData.description || undefined,
                businessHours: formData.businessHours || undefined,
                contactPhone: formData.contactPhone || undefined,
                website: formData.website || undefined,
            }

            if (myProfile?.id) {
                await dispatch(updateMyOwnerProfile(payload as any)).unwrap()
                toast.success("Cập nhật hồ sơ chủ sân thành công!")
                setIsEditing(false)
            } else {
                await dispatch(createOwnerProfile(payload as any)).unwrap()
                toast.success("Tạo hồ sơ chủ sân thành công!")
                setIsEditing(false)
            }
        } catch (error: any) {
            toast.error(error?.message || "Thao tác với hồ sơ chủ sân thất bại")
        }
    }

    // Handle toggle edit mode via "Đặt lại" button
    const handleReset = () => {
        if (!authUser?._id || authUser?.role !== "field_owner") return
        // If currently editing, turn off edit mode and reset to last saved values
        if (isEditing) {
            if (myProfile) {
                setFormData({
                    facilityName: myProfile.facilityName || "",
                    facilityLocation: myProfile.facilityLocation || "",
                    supportedSports: myProfile.supportedSports || [],
                    description: myProfile.description || "",
                    businessHours: myProfile.businessHours || "",
                    contactPhone: myProfile.contactPhone || user?.phone || "",
                    website: myProfile.website || "",
                    businessEmail: user?.email || "",
                })
            } else if (user) {
                setFormData({
                    facilityName: "",
                    facilityLocation: "",
                    supportedSports: [],
                    description: "",
                    businessHours: "",
                    contactPhone: user.phone || "",
                    website: "",
                    businessEmail: user.email || "",
                })
            }
            setIsEditing(false)
        } else {
            // If currently not editing, enable edit mode
            setIsEditing(true)
        }
    }

    // Booking list handlers
    const handleViewDetails = (bookingId: string) => {
        setSelectedBooking(sampleBookingData)
        setIsDetailsOpen(true)
    }

    const handleChat = (bookingId: string) => {
        console.log("Open chat for booking:", bookingId)
    }

    const handleSearch = (value: string) => {
        console.log("Search:", value)
    }

    const handleTimeFilterChange = (value: string) => {
        console.log("Time filter:", value)
    }

    const handleSortChange = (value: string) => {
        console.log("Sort:", value)
    }

    const handleTabChange = (value: string) => {
        console.log("Tab:", value)
    }

    return (
        <>
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-10">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 pb-5 border-b border-gray-200">
                        <Building2 className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Thông tin Chủ sân
                        </h2>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5 md:col-span-2">
                                <Label className="text-base font-normal text-start">
                                    Tên cơ sở *
                                </Label>
                                <Input
                                    value={formData.facilityName}
                                    onChange={(e) => handleInputChange('facilityName', e.target.value)}
                                    placeholder="Nhập tên cơ sở"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2.5 md:col-span-2">
                                <Label className="text-base font-normal text-start">
                                    Môn thể thao hỗ trợ
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.values(SportType).map((sport) => {
                                        const checked = formData.supportedSports.includes(sport)
                                        return (
                                            <label
                                                key={sport}
                                                className={`flex items-center gap-2 text-sm rounded-md border px-3 py-2 transition-colors ${checked ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' : 'bg-white border-gray-300 text-[#6B7385]'} ${!isEditing ? 'opacity-70' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-emerald-600"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        setFormData((prev) => {
                                                            const next = new Set(prev.supportedSports)
                                                            if (e.target.checked) next.add(sport)
                                                            else next.delete(sport)
                                                            return { ...prev, supportedSports: Array.from(next) }
                                                        })
                                                    }}
                                                    disabled={!isEditing}
                                                />
                                                <span className="capitalize">{SPORT_LABELS[sport] || sport.replace("_", " ")}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Mô tả
                            </Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Mô tả về cơ sở của bạn..."
                                className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Thông tin liên hệ
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Số điện thoại liên hệ
                                </Label>
                                <Input
                                    type="tel"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                    placeholder="Nhập số điện thoại liên hệ"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                                    placeholder="Nhập email"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Địa chỉ cơ sở
                            </Label>
                            <Textarea
                                value={formData.facilityLocation}
                                onChange={(e) => handleInputChange('facilityLocation', e.target.value)}
                                placeholder="Nhập địa chỉ cơ sở..."
                                className="min-h-[80px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Giờ hoạt động
                                </Label>
                                <Input
                                    value={formData.businessHours}
                                    onChange={(e) => handleInputChange('businessHours', e.target.value)}
                                    placeholder="Ví dụ: Thứ 2-CN: 6:00-22:00"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Website
                                </Label>
                                <Input
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Field Owner Status */}
                    <div className="space-y-4 p-4 bg-blue-50 rounded-[10px] border border-blue-200">
                        <h4 className="text-base font-medium text-blue-800">
                            Trạng thái Chủ sân
                        </h4>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${myProfile?.isVerified ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                            <span className="text-sm text-blue-700">
                                {myProfile?.isVerified ? 'Tài khoản chủ sân của bạn đã được xác minh' : 'Tài khoản chủ sân của bạn đang chờ xác minh'}
                            </span>
                        </div>
                        {typeof myProfile?.rating === 'number' && (
                            <p className="text-sm text-blue-600">
                                Đánh giá: {myProfile.rating} ({myProfile.totalReviews || 0} lượt)
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isEditing || loading || creating || updating || !formData.facilityName}
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium"
                        >
                            {myProfile ? (updating ? 'Đang lưu...' : 'Lưu thay đổi') : (creating ? 'Đang tạo...' : 'Tạo hồ sơ')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Booking List Section */}
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0 mt-6">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Booking History Tabs */}
                    <BookingHistoryTabs initialTab="upcoming" />

                    <div className="mt-8 space-y-6">
                        {/* Main Content Card */}
                        <Card className="shadow-md">
                            <CardHeader className="border-b">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex-1 max-w-[530px]">
                                        <CardTitle className="text-xl font-semibold">
                                            Đặt Chỗ Của Tôi
                                        </CardTitle>
                                        <p className="text-gray-600 text-base mt-1.5">
                                            Quản lý và theo dõi tất cả các đặt chỗ sân sắp tới của bạn.
                                        </p>
                                    </div>
                                    <div className="flex-1 max-w-[742px]">
                                        <BookingFilters
                                            onSearch={handleSearch}
                                            onTimeFilterChange={handleTimeFilterChange}
                                            onSortChange={handleSortChange}
                                            onTabChange={handleTabChange}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <BookingTable
                                    bookings={mockBookings}
                                    onViewDetails={handleViewDetails}
                                    onChat={handleChat}
                                />
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        <BookingPagination
                            currentPage={currentPage}
                            totalPages={1}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <CourtBookingDetails
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            bookingData={selectedBooking}
        />
        </>
    )
}


