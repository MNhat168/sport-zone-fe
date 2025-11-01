"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import CoachCard from "./card-list/coach-card-props"
import { useRef, useEffect, useState, useMemo } from "react"
import axios from "axios"
import { FooterComponent } from "../../components/footer/footer-component"
import { useGeolocation } from "../../hooks/useGeolocation"
import { Navigation, MapPin, AlertCircle } from "lucide-react"

const BookingPage = () => {
    const coachesListRef = useRef<HTMLDivElement>(null)
    

    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt huấn luyện viên" }]

    // State for API data
    const [coaches, setCoaches] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [addressText, setAddressText] = useState<string>("")
    const {
        error: geolocationError,
        loading: geolocationLoading,
        supported: geolocationSupported,
        getCoordinates
    } = useGeolocation()
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Location helpers (aligned with field booking)
    const getLocationText = (loc: any): string => {
        try {
            return typeof loc === 'string' ? loc : loc?.address || ''
        } catch {
            return ''
        }
    }

    // Leaflet map refs and container id
    const mapContainerId = 'coaches-map-container'
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    // Normalized coaches for map markers
    const mappedCoaches = useMemo(() => {
        return coaches.map((coach: any) => {
            const loc: any = coach?.location
            let latitude: number | undefined
            let longitude: number | undefined
            try {
                if (loc && typeof loc === 'object') {
                    if (loc.geo) {
                        const g: any = loc.geo
                        if (Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
                            const [lng, lat] = g.coordinates as [number, number]
                            if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
                                latitude = lat
                                longitude = lng
                            }
                        } else {
                            const lat = g.latitude ?? g.lat
                            const lng = g.longitude ?? g.lng
                            if (typeof lat === 'number' && typeof lng === 'number') {
                                latitude = lat
                                longitude = lng
                            }
                        }
                    }
                }
            } catch {
                // ignore
            }
            return {
                id: coach.id,
                name: coach.name,
                locationText: getLocationText(loc),
                latitude,
                longitude,
            }
        })
    }, [coaches])

    const handleGetLocation = async () => {
        try {
            const coords = await getCoordinates()
            if (coords && coords.lat && coords.lng) {
                setUserLocation({ lat: coords.lat, lng: coords.lng } as any)
                setAddressText(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/coaches/all`
                );
                setCoaches(
                  Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || []
                );
            } catch (err: any) {
                setError(err?.message || 'Lỗi khi lấy danh sách huấn luyện viên');
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    // Initialize Leaflet map once (copied pattern from field list page)
    useEffect(() => {
        ;(async () => {
            try {
                const hasLeaflet = typeof (window as any).L !== 'undefined'
                if (!hasLeaflet) {
                    await new Promise<void>((resolve) => {
                        if (!document.getElementById('leaflet-css')) {
                            const link = document.createElement('link')
                            link.id = 'leaflet-css'
                            link.rel = 'stylesheet'
                            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
                            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
                            link.crossOrigin = ''
                            document.head.appendChild(link)
                        }
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
                const L: any = (window as any).L
                if (!mapRef.current) {
                    const container = document.getElementById(mapContainerId)
                    if (!container) return
                    mapRef.current = L.map(mapContainerId).setView([16.0471, 108.2062], 12)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapRef.current)
                }
            } catch (e) {
                console.error('Failed to initialize map', e)
            }
        })()
    }, [])

    // Update markers when coaches or user location changes
    useEffect(() => {
        const L: any = (window as any).L
        if (!L || !mapRef.current) return

        // Clear old markers
        markersRef.current.forEach(m => m.remove && m.remove())
        markersRef.current = []

        const bounds = L.latLngBounds([])

        // User location marker
        if (userLocation && userLocation.lat && userLocation.lng) {
            const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 6,
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.9
            }).addTo(mapRef.current)
            userMarker.bindPopup('Vị trí của bạn')
            markersRef.current.push(userMarker)
            bounds.extend([userLocation.lat, userLocation.lng])
        }

        // Coach markers
        mappedCoaches.forEach((c) => {
            if (c.latitude != null && c.longitude != null) {
                const marker = L.marker([c.latitude, c.longitude]).addTo(mapRef.current)
                const popupHtml = `
                    <div style="min-width: 160px">
                        <div style="font-weight:600;margin-bottom:4px">${c.name}</div>
                        <div style="font-size:12px;color:#4b5563;">${c.locationText || ''}</div>
                    </div>
                `
                marker.bindPopup(popupHtml)
                markersRef.current.push(marker)
                bounds.extend([c.latitude, c.longitude])
            }
        })

        if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds.pad(0.2))
        }
    }, [mappedCoaches, userLocation])

    

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
                <PageHeader title="Đặt huấn luyện viên" breadcrumbs={breadcrumbs} />
            </div>

            {/* Main container with flexbox layout */}
            <div className="px-4 min-h-screen">
                <div className="flex gap-6 items-start">
                    {/* Left Panel - Coaches List */}
                    <div className="flex-[6] bg-white flex flex-col h-screen">
                        {/* Geolocation UI (copied from field list style) */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Navigation className="w-4 h-4" />
                                        Tìm HLV gần tôi
                                    </h3>
                                    {geolocationSupported ? (
                                        <button
                                            onClick={handleGetLocation}
                                            disabled={geolocationLoading}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                        >
                                            {geolocationLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Đang lấy vị trí...
                                                </>
                                            ) : (
                                                <>
                                                    <Navigation className="w-4 h-4" />
                                                    Lấy vị trí của tôi
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Trình duyệt không hỗ trợ định vị</span>
                                        </div>
                                    )}
                                    {userLocation && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>
                                                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    )}
                                    {geolocationError && (
                                        <div className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{geolocationError.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            ref={coachesListRef}
                            className="flex-1 overflow-y-auto scrollbar-hide"
                            style={{
                                scrollBehavior: "smooth",
                                scrollSnapType: "y mandatory"
                            }}
                        >
                            <div className="space-y-4">
                                {loading && <div>Đang tải danh sách huấn luyện viên...</div>}
                                {error && <div className="text-red-500">{error}</div>}
                                {!loading && !error && coaches.length === 0 && (
                                    <div>Không có huấn luyện viên nào.</div>
                                )}
                                {!loading && !error && coaches.map((coach, index) => (
                                    <div key={coach.id || index} className="scroll-snap-start">
                                        <CoachCard
                                            id={coach.id}
                                            name={coach.name}
                                            location={coach.location}
                                            description={coach.description}
                                            rating={coach.rating}
                                            reviews={coach.totalReviews}
                                            price={coach.price}
                                            nextAvailability={coach.nextAvailability ?? ''}
                                        />
                                        
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Map (4/10 columns) */}
                    <div className="flex-[4] relative">
                        <div className="sticky top-16 h-[calc(100vh-4rem)] w-full">
                            {addressText && (
                                <div className="mb-3 p-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700">
                                    Địa chỉ: {addressText}
                                </div>
                            )}
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

export default BookingPage