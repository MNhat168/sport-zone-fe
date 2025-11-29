"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { getFieldById } from "@/features/field/fieldThunk"
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { FieldSelectionPlaceholder } from "./components/field-selection-placeholder"
import { ChevronLeft, ChevronRight, MapPin, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuickNavPills } from "@/pages/field-detail-page/components/QuickNavPills"
import { OverviewCard } from "@/pages/field-detail-page/components/OverviewCard"
import { RulesCard } from "@/pages/field-detail-page/components/RulesCard"
import { AmenitiesCard } from "@/pages/field-detail-page/components/AmenitiesCard"
import { GalleryCard } from "@/pages/field-detail-page/components/GalleryCard"
import { RatingCard } from "@/pages/field-detail-page/components/RatingCard"
import { LocationCard } from "@/pages/field-detail-page/components/LocationCard"

const mockDescription = "Sân cầu lông hiện đại với 4 sân tiêu chuẩn, máy đánh bóng tự động, tiện ích đầy đủ. Phù hợp tập luyện và thi đấu."
const mockRules = ["Không mang giày ngoài vào sân", "Hủy trước 24h", "Mang theo vợt cá nhân"]
const mockAmenities = ["Vợt miễn phí", "Nước uống", "Bãi đỗ xe"]
const mockImages = [
    "https://source.unsplash.com/random/800x600/?badminton-court-1",
    "https://source.unsplash.com/random/800x600/?badminton-court-2",
    "https://source.unsplash.com/random/800x600/?badminton-court-3",
    "https://source.unsplash.com/random/800x600/?badminton-court-4",
    "https://source.unsplash.com/random/800x600/?badminton-court-5",
]

export default function FieldViewPage() {
    const { fieldId } = useParams<{ fieldId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const { currentField, loading } = useAppSelector((s) => s.field)

    useEffect(() => {
        if (fieldId && (!currentField || currentField.id !== fieldId)) {
            dispatch(getFieldById(fieldId))
        }
    }, [fieldId, currentField, dispatch])

    const overviewRef = useRef<HTMLDivElement | null>(null)
    const rulesRef = useRef<HTMLDivElement | null>(null)
    const amenitiesRef = useRef<HTMLDivElement | null>(null)
    const galleryRef = useRef<HTMLDivElement | null>(null)
    const ratingRef = useRef<HTMLDivElement | null>(null)
    const locationRef = useRef<HTMLDivElement | null>(null)

    // Active pill logic
    const [activeTab, setActiveTab] = useState("overview")
    const scrollToSection = (sectionId: string) => {
        const el = document.getElementById(sectionId)
        if (!el) return
        setActiveTab(sectionId)
        const offset = 100
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - offset
        const startY = window.pageYOffset
        const distance = offsetPosition - startY
        const duration = 600
        let startTime: number | null = null
        const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
        const step = (ts: number) => {
            if (startTime === null) startTime = ts
            const elapsed = ts - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = easeInOutCubic(progress)
            window.scrollTo(0, startY + distance * eased)
            if (elapsed < duration) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }

    useEffect(() => {
        const handleScroll = () => {
            const ids = ["overview", "rules", "amenities", "gallery", "rating", "location"]
            if (window.scrollY < 50) {
                setActiveTab("overview")
                return
            }
            const scrollPosition = window.scrollY + 120
            for (const id of ids) {
                const element = document.getElementById(id)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveTab(id)
                        break
                    }
                }
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const locationText = useMemo(() => {
        const loc: any = (currentField as any)?.location
        if (typeof loc === "string") return loc
        if (loc && typeof loc === "object") {
            const parts = [loc.address, loc.ward, loc.district, loc.city, loc.province].filter(Boolean)
            return parts.length ? parts.join(", ") : "Địa chỉ đang cập nhật"
        }
        return "Địa chỉ đang cập nhật"
    }, [currentField])

    type Amenity = { amenityId?: string | number; name?: string; price?: number } | string

    const amenitiesRaw: Amenity[] = useMemo(() => {
        const raw = (currentField as any)?.amenities as Amenity[] | undefined
        return Array.isArray(raw) ? raw : []
    }, [currentField])

    const amenitiesDisplay = useMemo(() => {
        return amenitiesRaw.map((a, idx) => {
            if (typeof a === "string") {
                return { key: `amenity-${idx}`, label: a }
            }
            const key = String((a as any)?.amenityId ?? `amenity-${idx}`)
            const name = (a as any)?.name ?? "Tiện ích"
            const price = (a as any)?.price
            const label = price != null && price !== "" ? `${name} - ${Number(price).toLocaleString()}đ` : String(name)
            return { key, label }
        })
    }, [amenitiesRaw])

    const rules: string[] = useMemo(() => {
        const raw = (currentField as any)?.rules as string[] | undefined
        return Array.isArray(raw) && raw.length > 0 ? raw : mockRules
    }, [currentField])

    const ratingValue: number = useMemo(() => {
        const r = (currentField as any)?.rating ?? (currentField as any)?.averageRating
        const n = Number(r)
        return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 0
    }, [currentField])

    // Image carousel
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const [viewportWidth, setViewportWidth] = useState(0)

    const images: string[] = useMemo(() => {
        return ((currentField?.images as string[]) || []).filter(Boolean)
    }, [currentField])

    const placeholderImg = "/general-img-portrait.png"

    const displayImages: string[] = useMemo(() => {
        const base = images.length > 0 ? images : [placeholderImg]
        if (base.length < 5) {
            const duplicated: string[] = []
            while (duplicated.length < 5) {
                duplicated.push(...base)
            }
            return duplicated.slice(0, 5)
        }
        return base
    }, [images])

    const extendedImages = useMemo(() => {
        if (displayImages.length === 0) return [] as string[]
        const prefix = displayImages.slice(-5)
        const suffix = displayImages.slice(0, 5)
        return [...prefix, ...displayImages, ...suffix]
    }, [displayImages])

    useEffect(() => {
        if (extendedImages.length > 0) {
            setCurrentIndex(5)
        }
    }, [extendedImages])

    useEffect(() => {
        const update = () => {
            if (viewportRef.current) {
                setViewportWidth(viewportRef.current.clientWidth)
            }
        }
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    const nextSlide = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => prev + 1)
    }
    
    const prevSlide = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => prev - 1)
    }

    useEffect(() => {
        if (!isTransitioning) return
        const timer = setTimeout(() => {
            setIsTransitioning(false)
            if (currentIndex >= displayImages.length + 5) {
                setCurrentIndex(5)
            } else if (currentIndex < 5) {
                setCurrentIndex(displayImages.length + 4)
            }
        }, 600)
        return () => clearTimeout(timer)
    }, [currentIndex, isTransitioning, displayImages.length])

    const itemsPerView = 5
    const gapPx = 12
    const itemWidthPx = viewportWidth > 0 ? Math.floor((viewportWidth - gapPx * (itemsPerView - 1)) / itemsPerView) : 0
    const translateXPx = -(currentIndex * (itemWidthPx + gapPx))

    if (loading) {
        return (
            <FieldOwnerDashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải thông tin sân...</p>
                    </div>
                </div>
            </FieldOwnerDashboardLayout>
        )
    }

    if (!currentField && !loading) {
        return (
            <FieldOwnerDashboardLayout>
                <FieldSelectionPlaceholder />
            </FieldOwnerDashboardLayout>
        )
    }

    return (
        <FieldOwnerDashboardLayout>
            <div className="min-h-screen bg-white">
                <div className="p-6">

                    {/* Image Carousel */}
                    {extendedImages.length > 0 && (
                        <div
                            ref={viewportRef}
                            className="relative w-full h-56 md:h-72 lg:h-80 mb-6 overflow-hidden select-none rounded-lg"
                        >
                            <div
                                ref={carouselRef}
                                className="flex h-full gap-3"
                                style={{
                                    transform: `translateX(${translateXPx}px)`,
                                    transition: isTransitioning ? "transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
                                }}
                            >
                                {extendedImages.map((src, i) => (
                                    <div
                                        key={`slide-${i}`}
                                        className="flex-none h-full"
                                        style={{ width: itemWidthPx ? `${itemWidthPx}px` : undefined }}
                                    >
                                        <img
                                            src={src || "/placeholder.svg"}
                                            alt={`Ảnh ${i + 1}`}
                                            className="w-full h-full object-cover rounded-md object-center"
                                            onError={(e) => {
                                                ; (e.target as HTMLImageElement).src = placeholderImg
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                aria-label="Ảnh trước"
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow border"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                aria-label="Ảnh tiếp"
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow border"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {currentField?.name}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{locationText}</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => navigate(`/field-owner/fields/${fieldId}/edit`)}
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        </div>

                        <hr className="border-t border-gray-200 my-4" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Môn Thể thao:</span>
                                <span className="font-medium">{String(currentField?.sportType || "-")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Giá:</span>
                                <span className="font-medium">
                                    {currentField?.price || 
                                        (currentField?.basePrice ? `${currentField.basePrice.toLocaleString()}đ/giờ` : "-")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Trạng thái:</span>
                                <span className={`font-medium ${currentField?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {currentField?.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-[#FAFAFA] rounded-lg p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <QuickNavPills
                                    activeTab={activeTab}
                                    pills={[
                                        { k: "overview", label: "Overview" },
                                        { k: "rules", label: "Rules" },
                                        { k: "amenities", label: "Amenities" },
                                        { k: "gallery", label: "Gallery" },
                                        { k: "rating", label: "Rating" },
                                        { k: "location", label: "Location" },
                                    ]}
                                    onSelect={(k) => scrollToSection(k)}
                                />

                                <div className="mt-4 space-y-4">
                                    <OverviewCard 
                                        refObj={overviewRef} 
                                        id="overview" 
                                        description={currentField?.description || mockDescription} 
                                    />

                                    <RulesCard 
                                        refObj={rulesRef} 
                                        id="rules" 
                                        rules={rules} 
                                    />

                                    <AmenitiesCard 
                                        refObj={amenitiesRef} 
                                        id="amenities" 
                                        items={amenitiesDisplay} 
                                        fallback={mockAmenities} 
                                    />

                                    <GalleryCard 
                                        refObj={galleryRef} 
                                        id="gallery" 
                                        images={(currentField?.images as string[]) || []} 
                                        fallback={mockImages} 
                                    />

                                    <RatingCard 
                                        refObj={ratingRef} 
                                        id="rating" 
                                        ratingValue={ratingValue} 
                                        reviewCount={((currentField as any)?.reviewCount ?? 0) as number} 
                                    />

                                    <LocationCard
                                        refObj={locationRef}
                                        id="location"
                                        addressText={String(((currentField as any)?.location?.address ?? locationText) || "")}
                                        geoCoords={(() => {
                                            const c = (currentField as any)?.location?.geo?.coordinates as number[] | undefined
                                            return Array.isArray(c) && c.length === 2 ? [c[0], c[1]] : null
                                        })() as [number, number] | null}
                                    />
                                </div>
                            </div>

                            {/* Sidebar */}
                            <aside className="lg:col-span-1">
                                <div className="lg:sticky lg:top-20 space-y-4">
                                    <Card className="shadow-lg border-0 bg-white">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                Thông tin sân
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Giá cơ bản</p>
                                                <p className="text-3xl font-bold text-green-600">
                                                    {currentField?.price ||
                                                        (currentField?.basePrice ? `${currentField.basePrice.toLocaleString()}đ/h` : "Liên hệ")}
                                                </p>
                                            </div>
                                            <div className="pt-4 border-t">
                                                <p className="text-sm text-gray-600 mb-2">Thông tin bổ sung</p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Đánh giá:</span>
                                                        <span className="font-medium">
                                                            {ratingValue.toFixed(1)} ⭐ ({((currentField as any)?.reviewCount ?? 0)} đánh giá)
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Tổng đặt:</span>
                                                        <span className="font-medium">
                                                            {(currentField as any)?.totalBookings ?? 0} lượt
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => navigate(`/field-owner/fields/${fieldId}/edit`)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Chỉnh sửa sân
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </FieldOwnerDashboardLayout>
    )
}

