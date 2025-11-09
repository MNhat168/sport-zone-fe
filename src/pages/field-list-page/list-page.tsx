"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"

import FieldCard from "./card-list/field-card-props"
import { useRef, useEffect, useState } from "react"
import { FooterComponent } from "../../components/footer/footer-component"
import { useAppDispatch, useAppSelector } from "../../store/hook"
import { getAllFields } from "../../features/field/fieldThunk"
import { useGeolocation } from "../../hooks/useGeolocation"
import { locationAPIService } from "../../utils/geolocation"
import { Navigation, AlertCircle, Filter } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layouts/page-wrapper"

const FieldBookingPage = () => {
    const fieldsListRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    
    // Redux state
    const { fields, loading, error, pagination } = useAppSelector((state) => state.field)
    
    // Filter states
    const [filters, setFilters] = useState({
        location: "",
        type: "",
        page: 1,
        limit: 10
    })

    // Geolocation states
    const {
        loading: geolocationLoading,
        supported: geolocationSupported,
        getCoordinates
    } = useGeolocation()

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [nearbyFields, setNearbyFields] = useState<any[]>([])
    const [isLoadingNearby, setIsLoadingNearby] = useState(false)
    const [isNearbyMode, setIsNearbyMode] = useState(false)

    // Filter UI state
    const [nameFilter, setNameFilter] = useState('')
    const [sportFilter, setSportFilter] = useState('all')
    const [timeFilter, setTimeFilter] = useState('any')
    const [locationFilter, setLocationFilter] = useState('')
    const [priceSort, setPriceSort] = useState<string>('')
    const skipNextDebounceRef = useRef(false)

    // Leaflet map refs
    const mapContainerId = 'fields-map-container'
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    // Geolocation functions
    const handleGetLocation = async () => {
        try {
            console.log('📍 [FIELD LIST] Getting user location...')
            const coordinates = await getCoordinates()
            
            if (coordinates && coordinates.lat && coordinates.lng) {
                setUserLocation(coordinates as { lat: number; lng: number })
                console.log('✅ [FIELD LIST] Location obtained:', coordinates)
                
                // Get nearby fields
                await getNearbyFields(coordinates.lat, coordinates.lng)
            } else {
                console.log('❌ [FIELD LIST] Failed to get coordinates')
            }
        } catch (error) {
            console.error('❌ [FIELD LIST] Error getting location:', error)
        }
    }

    const getNearbyFields = async (lat: number, lng: number) => {
        setIsLoadingNearby(true)
        try {
            console.log('🔍 [FIELD LIST] Getting nearby fields for:', { lat, lng })
            
            const result = await locationAPIService.getNearbyFields({
                latitude: lat,
                longitude: lng,
                radius: 10, // 10km radius
                limit: 20
            })

      if (result.success && result.data) {
        setNearbyFields(result.data);
        setIsNearbyMode(true);
        console.log(
          "✅ [FIELD LIST] Nearby fields loaded:",
          result.data.length
        );
      } else {
        console.error(
          "❌ [FIELD LIST] Failed to get nearby fields:",
          result.error
        );
        setNearbyFields([]);
        setIsNearbyMode(false);
      }
    } catch (error) {
      console.error("❌ [FIELD LIST] Error getting nearby fields:", error);
      setNearbyFields([]);
      setIsNearbyMode(false);
    } finally {
      setIsLoadingNearby(false);
    }
  };

    // Debounced fetch for all fields unless nearby mode is active
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isNearbyMode) return
            dispatch(getAllFields(filters))
        }, 500) // 500ms delay for debouncing

        return () => clearTimeout(timeoutId)
    }, [dispatch, filters, isNearbyMode])

    // Price formatting is now handled by backend (PriceFormatService)
    // Backend returns formatted price in 'price' field (e.g., "200.000đ/giờ")

    // When priceSort changes, auto-apply by updating `filters` so the debounced fetch runs.
    useEffect(() => {
        // Update filters state so UI and URL sync continue to work
        setFilters((prev) => {
            const prevAny: any = prev
            const sameSort = (
                (!!prevAny.sortBy && prevAny.sortBy === 'price') === !!priceSort &&
                (priceSort ? prevAny.sortOrder === priceSort : !prevAny.sortOrder)
            )
            // If nothing changes and we're already on page 1, avoid unnecessary state churn
            if (sameSort && prev.page === 1) return prev

            const copy: any = { ...prevAny }
            // remove existing sort keys
            delete copy.sortBy
            delete copy.sortOrder
            if (priceSort) {
                copy.sortBy = 'price'
                copy.sortOrder = priceSort
            }
            copy.page = 1
            return copy
        })

        // Immediately send the new sort to the server (unless we're in nearby mode)
        // This bypasses the 500ms debounce so the list refreshes right away when sorting changes.
        if (isNearbyMode) return

        try {
            const base: any = {}
            // Build payload from current local filters (not from `filters` to avoid re-run loops)
            if (nameFilter && nameFilter.trim()) base.name = nameFilter.trim()
            if (sportFilter && sportFilter !== 'all') base.sportType = sportFilter
            if (timeFilter && timeFilter !== 'any') base.weekday = timeFilter
            if (locationFilter && locationFilter.trim()) base.location = locationFilter.trim()
            if (priceSort) {
                base.sortBy = 'price'
                base.sortOrder = priceSort
            }
            base.page = 1
            base.limit = 10
            // mark to skip the next debounced fetch
            skipNextDebounceRef.current = true
            dispatch(getAllFields(base))
        } catch (error) {
            console.error('❌ [FIELD LIST] Error sorting fields:', error)
        }
    }, [priceSort, isNearbyMode, dispatch, nameFilter, sportFilter, timeFilter, locationFilter])

    // Read query params and update filters when location changes
    const location = useLocation()
    const navigate = useNavigate()
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search)
            const qType = params.get('type') || ''
            // location should come from explicit location/loc param only — do NOT fallback to `name`
            const qLocation = params.get('location') || params.get('loc') || ''
            const qName = params.get('name') || ''
            // weekday param from landing is 'weekday'
            const qWeekday = params.get('weekday') || params.get('time') || ''

            // Update the filters used by the backend fetch
            setFilters((prev) => ({ ...prev, type: qType, sportType: qType, location: qLocation, page: 1 }))

            // Also update the local UI filter controls so the page shows the selected values
            // name input
            setNameFilter(qName)
            // sport select: default to 'all' when missing to keep Select UI consistent
            setSportFilter(qType || 'all')
            // weekday/time select: default to 'any' when missing
            setTimeFilter(qWeekday || 'any')
            // location input
            setLocationFilter(qLocation)
        } catch (error: any) {
            console.error('❌ [FIELD LIST] Error reading query params:', error)
        }
    }, [location.search])

    // Auto-sync local UI filters to `filters` so changes immediately trigger the debounced fetch.
    // This makes name, sport (type), weekday (timeFilter) and location auto-apply without needing to click "Áp dụng lọc".
    useEffect(() => {
        setFilters((prev) => {
            const copy: any = { ...prev }

            // name filter
            if (nameFilter && nameFilter.trim()) {
                copy.name = nameFilter.trim()
            } else {
                delete copy.name
            }

            // sport/type filter: treat 'all' as empty
            if (sportFilter && sportFilter !== 'all') {
                copy.type = sportFilter
                copy.sportType = sportFilter // backend expects sportType
            } else {
                delete copy.type
                delete copy.sportType
            }

            // weekday/time filter: treat 'any' as empty
            if (timeFilter && timeFilter !== 'any') {
                copy.weekday = timeFilter
            } else {
                delete copy.weekday
            }

            // location filter
            if (locationFilter && locationFilter.trim()) {
                copy.location = locationFilter.trim()
            } else {
                delete copy.location
            }

            // always reset to first page when filters change
            copy.page = 1

            return copy
        })
    }, [nameFilter, sportFilter, timeFilter, locationFilter])

    // Compute hasActiveFilters for reset button visibility
    const hasActiveFilters = !!(
        nameFilter ||
        (sportFilter && sportFilter !== 'all') ||
        (timeFilter && timeFilter !== 'any') ||
        locationFilter ||
        priceSort
    )

    // Transform field data to match FieldCard props (prefer nearby when in nearby mode)
    const transformedFields = ((isNearbyMode && nearbyFields.length > 0) ? nearbyFields : fields).map((field) => {
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

        // Backend provides formatted price in 'price' field (e.g., "200.000đ/giờ" or "N/A")
        const formattedPrice = (field as any).price || 'N/A';

        return {
            id: (field as any).id,
            name: (field as any).name,
            location: locationText,
            description: (field as any).description || 'Mô tả không có sẵn',
            rating: (field as any).rating || 4.5,
            reviews: (field as any).reviews || (field as any).totalBookings || 0,
            price: formattedPrice,
            nextAvailability: (field as any).isActive !== false ? 'Có sẵn' : 'Không có sẵn',
            sportType: (field as any).sportType || 'unknown',
            imageUrl: (field as any).imageUrl || (field as any).images?.[0] || '/placeholder-field.jpg',
            distance: (field as any).distance ? `${(field as any).distance.toFixed(1)} km` : undefined,
            latitude: (field as any).latitude ?? (field as any).lat ?? (field as any)?.geo?.lat ?? (field as any)?.geo?.latitude,
            longitude: (field as any).longitude ?? (field as any).lng ?? (field as any)?.geo?.lng ?? (field as any)?.geo?.longitude,
        };
    })

    // Apply simple client-side filters from URL query params (name, type, location)
    const urlParams = new URLSearchParams(location.search)
    const qName = (urlParams.get('name') || '').toLowerCase()
    const qType = (urlParams.get('type') || '').toLowerCase()
    const qLocation = (urlParams.get('location') || urlParams.get('loc') || '').toLowerCase()

    // Apply URL filters
    const filteredTransformedFields = transformedFields.filter((f) => {
        if (qName) {
            const inName = (f.name || '').toLowerCase().includes(qName)
            const inLocation = (f.location || '').toLowerCase().includes(qName)
            if (!inName && !inLocation) return false
        }
        if (qType) {
            const sport = (f.sportType || '').toLowerCase()
            if (sport && !sport.includes(qType)) return false
        }
        if (qLocation) {
            const loc = (f.location || '').toLowerCase()
            if (loc && !loc.includes(qLocation)) return false
        }
        return true
    })

    // Initialize map once
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
                    mapRef.current = L.map(mapContainerId).setView([16.0471, 108.2062], 12) // default center Da Nang
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapRef.current)
                }
            } catch (error: any) {
                console.error('❌ [FIELD LIST] Failed to initialize map', error)
            }
        })()
        // no cleanup to preserve map instance
    }, [])

  // Update markers when data changes
  useEffect(() => {
    const L: any = (window as any).L;
    if (!L || !mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove && m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    // User location marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 6,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.9,
      }).addTo(mapRef.current);
      userMarker.bindPopup("Vị trí của bạn");
      markersRef.current.push(userMarker);
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

        // Field markers
        filteredTransformedFields.forEach((f) => {
            if (f.latitude != null && f.longitude != null) {
                const marker = L.marker([f.latitude, f.longitude]).addTo(mapRef.current)
                const popupHtml = `
                    <div style="min-width: 160px">
                        <div style="font-weight:600;margin-bottom:4px">${f.name}</div>
                        <div style="font-size:12px;color:#4b5563;">${f.location}</div>
                        ${f.price ? `<div style="font-size:12px;margin-top:4px;color:#065f46">Giá: ${f.price}</div>` : ''}
                    </div>
                `;
        marker.bindPopup(popupHtml);
        markersRef.current.push(marker);
        bounds.extend([f.latitude, f.longitude]);
      }
    });

        if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds.pad(0.2))
        }
    }, [filteredTransformedFields, userLocation])

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
                    top: 80px; /* 80px = navbar height (h-20) */
                    height: calc(100vh); /* Full viewport height minus navbar */
                    overflow: hidden;
                    z-index: 10; /* Lower than navbar (z-50) */
                }
            `}</style>
            <NavbarDarkComponent />
            <PageWrapper>
                {/* Main container with flexbox layout */}
                <div className="flex flex-row">
                    <div className="w-full flex-[6]">
                        <div className="items-start">
                            {/* Left Panel - Fields List */}
                            <div className="bg-white flex flex-col h-screen p-4">
                                {/* Filters */}
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 flex items-center gap-3 flex-wrap">
                                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <Filter className="w-4 h-4" /> Lọc sân
                                            </h3>

                                            <Input className="min-w-[180px]" placeholder="Tên sân" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
                                            <Input className="min-w-[180px]" placeholder="Địa điểm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />

                                            <Select value={sportFilter} onValueChange={setSportFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Thể loại" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả</SelectItem>
                                                    <SelectItem value="football">Bóng đá</SelectItem>
                                                    <SelectItem value="tennis">Quần vợt</SelectItem>
                                                    <SelectItem value="badminton">Cầu lông</SelectItem>
                                                    <SelectItem value="basketball">Bóng rổ</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Select value={timeFilter} onValueChange={setTimeFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ngày trong tuần" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Bất kỳ</SelectItem>
                                                    <SelectItem value="mon">Thứ 2</SelectItem>
                                                    <SelectItem value="tue">Thứ 3</SelectItem>
                                                    <SelectItem value="wed">Thứ 4</SelectItem>
                                                    <SelectItem value="thu">Thứ 5</SelectItem>
                                                    <SelectItem value="fri">Thứ 6</SelectItem>
                                                    <SelectItem value="sat">Thứ 7</SelectItem>
                                                    <SelectItem value="sun">Chủ nhật</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {/* Price sort control: None / Low->High / High->Low */}
                                            <div className="ml-2">
                                                <Select value={priceSort} onValueChange={(v) => setPriceSort(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Giá" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="asc">Giá: thấp → cao</SelectItem>
                                                        <SelectItem value="desc">Giá: cao → thấp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {geolocationSupported ? (
                                                <button
                                                    onClick={handleGetLocation}
                                                    disabled={geolocationLoading || isLoadingNearby}
                                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                                >
                                                    {geolocationLoading || isLoadingNearby ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            {isLoadingNearby ? 'Đang tìm...' : 'Đang lấy vị trí...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Navigation className="w-4 h-4" /> Lấy vị trí của tôi
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <AlertCircle className="w-4 h-4" /> <span>Trình duyệt không hỗ trợ định vị</span>
                                                </div>
                                            )}

                                            {hasActiveFilters && (
                                                <Button
                                                    onClick={() => {
                                                        setNameFilter('')
                                                        setSportFilter('all')
                                                        setTimeFilter('any')
                                                        setLocationFilter('')
                                                        setPriceSort('')
                                                        setFilters((prev) => {
                                                            const copy: any = { ...prev }
                                                            delete copy.sortBy
                                                            delete copy.sortOrder
                                                            return { ...copy, type: '', sportType: '', location: '', page: 1 }
                                                        })
                                                        setIsNearbyMode(false)
                                                        setNearbyFields([])
                                                        setUserLocation(null)
                                                        // Clear query params so the effect that reads location.search
                                                        // doesn't immediately re-apply landing filters.
                                                        try {
                                                            navigate(location.pathname, { replace: true })
                                                        } catch (error: any) {
                                                            console.error('❌ [FIELD LIST] Error navigating:', error)
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                >
                                                    Đặt lại
                                                </Button>
                                            )}
                                        </div>

                                    </div>

                                    {isNearbyMode && nearbyFields.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Đã tìm thấy {nearbyFields.length} sân gần vị trí của bạn</span>
                                        </div>
                                    )}
                                </div>

                                <div
                                    ref={fieldsListRef}
                                    className="flex-1 overflow-y-auto scrollbar-hide"
                                    style={{
                                        scrollBehavior: "smooth",
                                        scrollSnapType: "y mandatory"
                                    }}
                                >
                                    {(loading || isLoadingNearby) && (
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

                                    {!loading && !isLoadingNearby && !error && filteredTransformedFields.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">Không tìm thấy sân thể thao nào.</p>
                                        </div>
                                    )}
                                    {!loading && !error && filteredTransformedFields.length > 0 && (
                                        <div className="space-y-4">
                                            {filteredTransformedFields.map((field, index) => (
                                                <div key={field.id || index} className="scroll-snap-start">
                                                    <FieldCard
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
                                                        distance={field.distance}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!loading && !isLoadingNearby && !isNearbyMode && pagination && pagination.total > filters.limit && (
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
                        </div>
                    </div>
                    <div className="w-full flex-[4]">
                        <div id={mapContainerId} className="map-container w-full" />
                    </div>
                </div>
            </PageWrapper>
            <FooterComponent />
        </div>
    );
};

export default FieldBookingPage;
