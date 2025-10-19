"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import OwnerFieldCard from "./owner-field-card"
import { useRef, useEffect, useState } from "react"
import { FooterComponent } from "../../components/footer/footer-component"
import { useAppDispatch, useAppSelector } from "../../store/hook"
import { getMyFields } from "../../features/field/fieldThunk"
import { Filter } from "lucide-react"
import { SportType } from "@/components/enums/ENUMS"

const OwnerFieldListPage = () => {
    const fieldsListRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    
    // Redux state
    const { fields, loading, error, pagination } = useAppSelector((state) => state.field)
    
    // Filter states
    const [filters, setFilters] = useState({
        name: "",
        sportType: "" as SportType | string,
        isActive: undefined as boolean | undefined,
        page: 1,
        limit: 10
    })

    // Leaflet map refs
    const mapContainerId = 'owner-fields-map-container'
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Quản lý sân thể thao" }]

    // Debounced fetch for my fields
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(getMyFields({
                ...filters,
                sportType: filters.sportType as any
            }))
        }, 500) // 500ms delay for debouncing

        return () => clearTimeout(timeoutId)
    }, [dispatch, filters])

    // Transform field data to match FieldCard props
    const transformedFields = fields.map((field) => {
        // Normalize location to a string for rendering
        const rawLocation: any = (field as any).location ?? (field as any).address;
        let locationText = 'Địa chỉ không xác định';
        if (typeof rawLocation === 'string' && rawLocation.trim()) {
            locationText = rawLocation;
        } else if (rawLocation && typeof rawLocation === 'object') {
            const address = (rawLocation as any).address;
            const geo = (rawLocation as any).geo;
            const lat = geo?.latitude ?? geo?.lat;
            const lng = geo?.longitude ?? geo?.lng;
            if (typeof address === 'string' && address.trim()) {
                locationText = address;
            } else if (lat != null && lng != null) {
                locationText = `${lat}, ${lng}`;
            }
        }

        return {
            id: (field as any).id,
            name: (field as any).name,
            location: locationText,
            description: (field as any).description || 'Mô tả không có sẵn',
            rating: (field as any).rating || 4.5,
            reviews: (field as any).reviews || (field as any).totalBookings || 0,
            price: (field as any).price || `${(field as any).basePrice || 0}k/h`,
            nextAvailability: (field as any).isActive !== false ? 'Có sẵn' : 'Không có sẵn',
            sportType: (field as any).sportType || 'unknown',
            imageUrl: (field as any).imageUrl || (field as any).images?.[0] || '/placeholder-field.jpg',
            isActive: (field as any).isActive !== false,
            latitude: (field as any).latitude ?? (field as any).lat ?? (field as any)?.geo?.lat ?? (field as any)?.geo?.latitude,
            longitude: (field as any).longitude ?? (field as any).lng ?? (field as any)?.geo?.lng ?? (field as any)?.geo?.longitude,
        };
    })

    // Load Leaflet from CDN if not loaded
    const ensureLeafletLoaded = async (): Promise<void> => {
        const hasLeaflet = typeof (window as any).L !== 'undefined'
        if (hasLeaflet) return
        await new Promise<void>((resolve) => {
            // CSS
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link')
                link.id = 'leaflet-css'
                link.rel = 'stylesheet'
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
                link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
                link.crossOrigin = ''
                document.head.appendChild(link)
            }
            // JS
            const scriptId = 'leaflet-js'
            if (document.getElementById(scriptId)) {
                resolve()
                return
            }
            const script = document.createElement('script')
            script.id = scriptId
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
            script.crossOrigin = ''
            script.onload = () => resolve()
            document.body.appendChild(script)
        })
    }

    // Initialize map once
    useEffect(() => {
        (async () => {
            try {
                await ensureLeafletLoaded()
                const L: any = (window as any).L
                if (!mapRef.current) {
                    const container = document.getElementById(mapContainerId)
                    if (!container) return
                    mapRef.current = L.map(mapContainerId).setView([16.0471, 108.2062], 12) // default center Da Nang
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapRef.current)
                }
            } catch (e) {
                console.error('Failed to initialize map', e)
            }
        })()
        // no cleanup to preserve map instance
    }, [])

    // Update markers when data changes (only field markers, no user location)
    useEffect(() => {
        const L: any = (window as any).L
        if (!L || !mapRef.current) return

        // Clear old markers
        markersRef.current.forEach(m => m.remove && m.remove())
        markersRef.current = []

        const bounds = L.latLngBounds([])

        // Field markers only
        transformedFields.forEach((f) => {
            if (f.latitude != null && f.longitude != null) {
                const marker = L.marker([f.latitude, f.longitude]).addTo(mapRef.current)
                const popupHtml = `
                    <div style="min-width: 160px">
                        <div style="font-weight:600;margin-bottom:4px">${f.name}</div>
                        <div style="font-size:12px;color:#4b5563;">${f.location}</div>
                        ${f.price ? `<div style="font-size:12px;margin-top:4px;color:#065f46">Giá: ${f.price}</div>` : ''}
                        <div style="font-size:12px;margin-top:4px;color:#059669">Trạng thái: ${f.nextAvailability}</div>
                    </div>
                `
                marker.bindPopup(popupHtml)
                markersRef.current.push(marker)
                bounds.extend([f.latitude, f.longitude])
            }
        })

        if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds.pad(0.2))
        }
    }, [transformedFields])

    return (
        <div className="min-h-screen">
            <style>{`
                /* Custom scrollbar styles */
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                /* Smooth scroll snap behavior */
                .scroll-snap-start {
                    scroll-snap-align: start;
                }

                /* Custom scroll container */
                .custom-scroll-container {
                    scroll-behavior: smooth;
                    overflow-y: auto;
                }

                /* Map container specific styles */
                .map-container {
                    position: sticky;
                    top: 0;
                    height: 1078px;
                    overflow: hidden;
                }
            `}</style>
            <NavbarDarkComponent />
            <div className="pt-16">
                <PageHeader title="Quản lý sân thể thao" breadcrumbs={breadcrumbs} />
            </div>

            {/* Main container with flexbox layout */}
            <div className="px-4 min-h-screen">
                <div className="flex gap-6 items-start">
                    {/* Left Panel - Fields List */}
                    <div className="flex-[6] bg-white flex flex-col h-screen">
                        {/* Filters */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Danh sách sân thể thao
                                </h3>
                                <div className="text-sm text-gray-600">
                                    Tổng cộng: {pagination?.total || 0} sân
                                </div>
                            </div>
                            
                            {/* Filter Controls */}
                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên sân..."
                                        value={filters.name}
                                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value, page: 1 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filters.sportType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sportType: e.target.value, page: 1 }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Tất cả loại sân</option>
                                        <option value="football">Bóng đá</option>
                                        <option value="tennis">Tennis</option>
                                        <option value="badminton">Cầu lông</option>
                                        <option value="basketball">Bóng rổ</option>
                                        <option value="volleyball">Bóng chuyền</option>
                                        <option value="swimming">Bơi lội</option>
                                        <option value="gym">Gym</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={filters.isActive === undefined ? "" : filters.isActive.toString()}
                                        onChange={(e) => setFilters(prev => ({ 
                                            ...prev, 
                                            isActive: e.target.value === "" ? undefined : e.target.value === "true",
                                            page: 1 
                                        }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Tạm dừng</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={fieldsListRef}
                            className="flex-1 overflow-y-auto scrollbar-hide"
                            style={{
                                scrollBehavior: "smooth",
                                scrollSnapType: "y mandatory"
                            }}
                        >
                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="animate-pulse">
                                            <div className="flex bg-white rounded-lg shadow p-4">
                                                <div className="w-32 h-32 bg-gray-300 rounded-lg"></div>
                                                <div className="ml-4 flex-1">
                                                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <strong className="font-bold">Error!</strong>
                                    <span className="block sm:inline"> {error.message}</span>
                                </div>
                            )}

                            {!loading && !error && transformedFields.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">Không có sân thể thao nào.</p>
                                </div>
                            )}

                            {!loading && !error && transformedFields.length > 0 && (
                                <div className="space-y-4">
                                    {transformedFields.map((field, index) => (
                                        <div key={field.id || index} className="scroll-snap-start">
                                            <OwnerFieldCard
                                                id={field.id}
                                                name={field.name}
                                                location={field.location}
                                                description={field.description}
                                                rating={field.rating}
                                                reviews={field.reviews}
                                                price={field.price}
                                                nextAvailability={field.nextAvailability}
                                                sportType={field.sportType}
                                                imageUrl={field.imageUrl}
                                                isActive={field.isActive}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && pagination && pagination.total > filters.limit && (
                                <div className="flex justify-center mt-6 space-x-2">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700"
                                    >
                                        Trang trước
                                    </button>
                                    <span className="px-4 py-2 bg-gray-100 rounded">
                                        Trang {filters.page} / {Math.ceil(pagination.total / filters.limit)}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={filters.page >= Math.ceil(pagination.total / filters.limit)}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Map (4/10 columns) */}
                    <div className="flex-[4] relative">
                        <div className="sticky top-16 h-[calc(100vh-4rem)] w-full">
                            <div id={mapContainerId} className="absolute h-full w-full p-0 border-0 m-0 left-0 top-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer để đảm bảo có thể scroll */}
            <FooterComponent />
        </div>
    )
}

export default OwnerFieldListPage
