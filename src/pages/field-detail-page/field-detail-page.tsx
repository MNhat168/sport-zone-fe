"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { getFieldById } from "@/features/field/fieldThunk"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { FooterComponent } from "@/components/footer/footer-component"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import { ChevronLeft, ChevronRight, MapPin, Share2, Star, CalendarDays } from "lucide-react"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QuickNavPills } from "./components/QuickNavPills"
import { OverviewCard } from "./components/OverviewCard"
import { RulesCard } from "./components/RulesCard"
import { AmenitiesCard } from "./components/AmenitiesCard"
import { GalleryCard } from "./components/GalleryCard"
import { RatingCard } from "./components/RatingCard"
import { LocationCard } from "./components/LocationCard"
import { Button } from "@/components/ui/button"


const mockDescription =
    "Sân cầu lông hiện đại với 4 sân tiêu chuẩn, máy đánh bóng tự động, tiện ích đầy đủ. Phù hợp tập luyện và thi đấu."
const mockRules = ["Không mang giày ngoài vào sân", "Hủy trước 24h", "Mang theo vợt cá nhân"]
const mockAmenities = ["Vợt miễn phí", "Nước uống", "Bãi đỗ xe"]
const mockImages = [
    "https://source.unsplash.com/random/800x600/?badminton-court-1",
    "https://source.unsplash.com/random/800x600/?badminton-court-2",
    "https://source.unsplash.com/random/800x600/?badminton-court-3",
    "https://source.unsplash.com/random/800x600/?badminton-court-4",
    "https://source.unsplash.com/random/800x600/?badminton-court-5",
]

const FieldDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const { currentField, loading } = useAppSelector((s) => s.field)

    useEffect(() => {
        if (id && (!currentField || currentField.id !== id)) {
            dispatch(getFieldById(id))
        }
    }, [id, currentField, dispatch])

    const overviewRef = useRef<HTMLDivElement | null>(null)
    const rulesRef = useRef<HTMLDivElement | null>(null)
    const amenitiesRef = useRef<HTMLDivElement | null>(null)
    const galleryRef = useRef<HTMLDivElement | null>(null)
    const ratingRef = useRef<HTMLDivElement | null>(null)
    const locationRef = useRef<HTMLDivElement | null>(null)
    // Leaflet map refs
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const mapRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)


    // Active pill logic similar to coach-profile-page
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

    // ===== Leaflet Map: CSS loader, map/marker init, geocode address =====
    useEffect(() => {
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.id = "leaflet-css"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            document.head.appendChild(link)
        }
    }, [])

    const geocodeAddress = async (query: string): Promise<{ lat: number; lon: number } | null> => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=vn&q=${encodeURIComponent(query)}`
            const res = await fetch(url, { headers: { Accept: "application/json" } })
            if (!res.ok) return null
            const data: Array<{ lat: string; lon: string }> = await res.json()
            if (Array.isArray(data) && data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lon = parseFloat(data[0].lon)
                if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lon }
            }
            return null
        } catch {
            return null
        }
    }

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return

        const hasSize = () => {
            if (!mapContainerRef.current) return false
            const rect = mapContainerRef.current.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0
        }

        const initializeMap = () => {
            if (!mapContainerRef.current || mapRef.current) return
            const map = L.map(mapContainerRef.current, {
                center: [10.776889, 106.700806],
                zoom: 13,
                doubleClickZoom: false,
                zoomControl: true,
            })

            const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            })
            tileLayer.addTo(map)

            // Default marker icon (fixes missing icon issue)
            const defaultIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            })
                ; (L as any).Marker.prototype.options.icon = defaultIcon

            mapRef.current = map

            // Invalidate size a few times to render tiles correctly
            setTimeout(() => map.invalidateSize(), 100)
            setTimeout(() => map.invalidateSize(), 300)
            setTimeout(() => map.invalidateSize(), 500)
        }

        // Delay init until container has dimensions
        if (!hasSize()) {
            setTimeout(() => {
                if (hasSize()) initializeMap()
            }, 250)
        } else {
            initializeMap()
        }
    }, [])

    useEffect(() => {
        const map = mapRef.current
        if (!map) return
        const geo = (currentField as any)?.location?.geo?.coordinates as number[] | undefined
        const hasCoords = Array.isArray(geo) && geo.length === 2 && Number.isFinite(geo[0]) && Number.isFinite(geo[1])
        const q = String((currentField as any)?.location?.address || locationText || "").trim()
        if (!hasCoords && !q) return
        let cancelled = false
            ; (async () => {
                let lat: number | null = null
                let lon: number | null = null
                if (hasCoords) {
                    const [lng, la] = geo as number[]
                    lat = la
                    lon = lng
                } else {
                    const gc = await geocodeAddress(q)
                    if (gc) {
                        lat = gc.lat
                        lon = gc.lon
                    }
                }
                if (cancelled || lat == null || lon == null) return
                if (!markerRef.current) {
                    markerRef.current = L.marker([lat, lon]).addTo(map)
                } else {
                    markerRef.current.setLatLng([lat, lon])
                }
                map.flyTo([lat, lon], Math.max(map.getZoom(), 14), { duration: 1.0 })
            })()
        return () => {
            cancelled = true
        }
    }, [currentField, locationText])

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="bg-white">
                <div className="w-full">
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
                </div>

                <div className="w-full pb-6">
                    <div className="max-w-6xl mx-auto px-2">
                        {/* Upper side: two columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
                            {/* left */}
                            <div className="md:col-span-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-left">{currentField?.name}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-gray-600">
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{locationText}</span>
                                    </span>
                                </div>
                            </div>
                            {/* right */}
                            <div className="flex md:justify-center items-center gap-4">
                                <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <Share2 className="h-4 w-4" />
                                    <span>Share</span>
                                </button>
                                <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>Add to favorites</span>
                                </button>
                            </div>
                        </div>
                        <hr className="border-t border-gray-200 my-4" />
                        {/* under side: two columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Môn Thể thao:</span>
                                <span className="font-medium">{String(currentField?.sportType || "-")}</span>
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <span className="text-gray-500">Giá:</span>
                                <span className="font-medium">{currentField?.price || ((currentField as any)?.basePrice ? `${(currentField as any).basePrice.toLocaleString()}đ/giờ` : "-")}</span>
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="w-full bg-[#FAFAFA]">
                    <div className="max-w-6xl mx-auto pt-6">
                        {!loading && currentField && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
                                <div className="lg:col-span-2 space-y-4 text-left">
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

                                    {/* Always-visible sections */}
                                    <div className="mt-4 space-y-4">
                                        <OverviewCard refObj={overviewRef} id="overview" description={currentField.description || mockDescription} />

                                        <RulesCard refObj={rulesRef} id="rules" rules={rules} />

                                        <AmenitiesCard refObj={amenitiesRef} id="amenities" items={amenitiesDisplay} fallback={mockAmenities} />

                                        <GalleryCard refObj={galleryRef} id="gallery" images={(currentField.images as string[]) || []} fallback={mockImages} />

                                        <RatingCard refObj={ratingRef} id="rating" ratingValue={ratingValue} reviewCount={((currentField as any)?.reviewCount ?? 0) as number} />

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

                                <aside className="lg:col-span-1">
                                    <div className="lg:sticky lg:top-20 space-y-4">
                                        <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
                                            <CardHeader className="">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 shrink-0">
                                                        <CalendarDays className="h-6 w-6 text-green-600 block" />
                                                    </div>
                                                    <div className="text-left">
                                                        <CardTitle className="text-lg font-semibold text-gray-900">Availability</CardTitle>
                                                        <CardDescription className="text-gray-600 text-sm mt-1">
                                                            Check availability on your convenient time
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </div>

                                    <div className="lg:sticky lg:top-20 space-y-4 pt-6">
                                        <Card className="shadow-lg border-0 bg-white">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-sm text-gray-700">Availability</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Book a Court</p>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        {currentField.price ||
                                                            (currentField.basePrice ? `${currentField.basePrice.toLocaleString()}đ/h` : "Contact")}
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => navigate("/field-booking", { state: { fieldId: currentField.id } })}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 h-auto"
                                                >
                                                    Đặt sân ngay
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </aside>
                            </div>
                        )}
                    </div>
                </div>
                <FooterComponent />
            </PageWrapper>
        </>
    )
}

export default FieldDetailPage
