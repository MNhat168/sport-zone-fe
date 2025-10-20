import React, { useMemo } from 'react'
import type { Field } from '@/types/field-type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface AmenitiesTabProps {
    venue?: Field
    selectedAmenityIds?: string[]
    onChangeSelected?: (ids: string[]) => void
    onSubmit?: (ids: string[]) => void
    onBack?: () => void
}

export const AmenitiesTab: React.FC<AmenitiesTabProps> = ({
    venue,
    selectedAmenityIds = [],
    onChangeSelected,
    onSubmit,
    onBack,
}) => {
    const getLocationText = (loc: any): string => {
        return typeof loc === 'string' ? loc : loc?.address || ''
    }

    const getMapEmbedSrc = (loc: any): string => {
        try {
            if (loc && typeof loc === 'object' && (loc as any).geo && Array.isArray((loc as any).geo.coordinates)) {
                const [lng, lat] = (loc as any).geo.coordinates as [number, number]
                if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
                    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`
                }
            }
            const query = getLocationText(loc)
            if (query) {
                return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
            }
        } catch {
            // ignore
        }
        return 'about:blank'
    }

    const amenities = useMemo(() => {
        return venue?.amenities || []
    }, [venue?.amenities])

    const toggleAmenity = (amenityId: string) => {
        const set = new Set(selectedAmenityIds)
        if (set.has(amenityId)) set.delete(amenityId)
        else set.add(amenityId)
        onChangeSelected?.(Array.from(set))
    }

    const totalAmenityFee = useMemo(() => {
        return amenities
            .filter(a => selectedAmenityIds.includes(a.amenity._id))
            .reduce((acc, cur) => acc + (cur.price || 0), 0)
    }, [amenities, selectedAmenityIds])

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card - venue summary like BookCourt */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Chọn tiện ích
                        </h1>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap items-start gap-6">
                            <div className="flex-1 min-w-[800px]">
                                <div className="flex items-start gap-4">
                                    {venue?.images?.[0] && (
                                        <img
                                            src={venue.images[0]}
                                            alt={venue.name}
                                            className="w-24 h-28 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2">
                                            {venue?.name}
                                        </h2>
                                        <p className="text-base text-[#6b7280] font-['Outfit'] text-start">
                                            {venue?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[100px]">
                                <div className="px-24 py-6 bg-white rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-2xl font-semibold text-emerald-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(venue?.basePrice || 0)}
                                            </span>
                                            <span className="text-sm text-gray-500">/giờ</span>
                                        </div>
                                        <p className="text-sm text-[#1a1a1a] mt-1">Đơn giá theo giờ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[400px]">
                                <div className="w-full h-64 md:h-72 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <iframe
                                        title="Venue location map"
                                        src={getMapEmbedSrc(venue?.location as any)}
                                        className="w-full h-full pointer-events-none"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                                <p className="text-md text-[#6b7280] font-['Outfit'] mt-1 text-center">
                                    Địa chỉ: {getLocationText(venue?.location as any)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content - left amenities list, right summary */}
            <div className="flex flex-wrap gap-6">
                {/* Amenities List */}
                <div className="flex-1 min-w-[600px]">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Danh sách tiện ích
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {amenities.length === 0 ? (
                                <p className="text-sm text-gray-600">Sân này chưa có tiện ích.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {amenities.map((item) => {
                                        const id = item.amenity._id
                                        const checked = selectedAmenityIds.includes(id)
                                        return (
                                            <div key={id} className="flex items-start gap-3 p-4 rounded-lg border bg-white">
                                                <Checkbox
                                                    id={`amenity-${id}`}
                                                    checked={checked}
                                                    onCheckedChange={() => toggleAmenity(id)}
                                                />
                                                <label htmlFor={`amenity-${id}`} className="flex-1 cursor-pointer">
                                                    <div className="font-medium text-gray-900">{item.amenity.name}</div>
                                                    <div className="text-sm text-gray-600">{item.amenity.type}</div>
                                                    <div className="text-sm text-emerald-600 font-semibold mt-1">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                                                    </div>
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="w-96">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Tóm tắt tiện ích
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Số lượng đã chọn</Label>
                                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                                    {selectedAmenityIds.length} tiện ích
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button
                                    className="w-full h-auto py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-semibold font-['Outfit']"
                                    disabled
                                >
                                    Tổng phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmenityFee)}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-5 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={() => onSubmit?.(selectedAmenityIds)}
                    className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                >
                    Tiếp tục
                </Button>
            </div>
        </div>
    )
}

export default AmenitiesTab


