"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import FieldCard from "./card-list/field-card-props"
import { useRef, useEffect, useState } from "react"
import { FooterComponent } from "../../components/footer/footer-component"
import { useAppDispatch, useAppSelector } from "../../store/hook"
import { getAllFields } from "../../features/field/fieldThunk"
import { useGeolocation } from "../../hooks/useGeolocation"
import { locationAPIService } from "../../utils/geolocation"
import { Navigation, AlertCircle, Filter, Heart } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import { FilterSidebar } from "./filter-sidebar"

const FieldBookingPage = () => {
    const fieldsListRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    const { fields, loading, error, pagination } = useAppSelector((state) => state.field)
    const authUser = useAppSelector((state) => state.auth.user)
    const favouriteSports = authUser?.favouriteSports || []
    
    const [filters, setFilters] = useState({ location: "", type: "", page: 1, limit: 10 })
    const [isFilteringByFavorites, setIsFilteringByFavorites] = useState(false)
    const { loading: geolocationLoading, supported: geolocationSupported, getCoordinates } = useGeolocation()
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [nearbyFields, setNearbyFields] = useState<any[]>([])
    const [isLoadingNearby, setIsLoadingNearby] = useState(false)
    const [isNearbyMode, setIsNearbyMode] = useState(false)
    const [nameFilter, setNameFilter] = useState('')
    const [sportFilter, setSportFilter] = useState('all')
    const [timeFilter, setTimeFilter] = useState('any')
    const [locationFilter, setLocationFilter] = useState('')
    const [priceSort, setPriceSort] = useState<string>('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const skipNextDebounceRef = useRef(false)
    const nameInputRef = useRef<HTMLInputElement>(null)
    const locationInputRef = useRef<HTMLInputElement>(null)
    const mapContainerId = 'fields-map-container'
    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])

    const handleGetLocation = async () => {
        try {
            const coordinates = await getCoordinates()
            if (coordinates?.lat && coordinates?.lng) {
                setUserLocation(coordinates as { lat: number; lng: number })
                await getNearbyFields(coordinates.lat, coordinates.lng)
            }
        } catch (error) {
            console.error('Error getting location:', error)
        }
    }

    const getNearbyFields = async (lat: number, lng: number) => {
        setIsLoadingNearby(true)
        try {
            const result = await locationAPIService.getNearbyFields({ latitude: lat, longitude: lng, radius: 10, limit: 20 })
            if (result.success && result.data) {
                setNearbyFields(result.data)
                setIsNearbyMode(true)
            } else {
                setNearbyFields([])
                setIsNearbyMode(false)
            }
        } catch {
            setNearbyFields([])
            setIsNearbyMode(false)
        } finally {
            setIsLoadingNearby(false)
        }
    }

    useEffect(() => {
        if (skipNextDebounceRef.current) {
            skipNextDebounceRef.current = false
            return
        }
        const timeoutId = setTimeout(() => {
            if (!isNearbyMode) dispatch(getAllFields(filters))
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [dispatch, filters, isNearbyMode])

    // Auto-filter by favorite sports on mount
    useEffect(() => {
        if (
            authUser && 
            favouriteSports.length > 0 && 
            !isFilteringByFavorites &&
            sportFilter === 'all' &&
            !nameFilter &&
            !locationFilter &&
            !isNearbyMode
        ) {
            // Auto-enable favorite sports filter
            setIsFilteringByFavorites(true)
            setFilters((prev) => ({
                ...prev,
                sportTypes: favouriteSports,
                page: 1
            } as any))
        }
    }, [authUser, favouriteSports])

    // Toggle favorite sports filter
    const handleToggleFavoriteFilter = () => {
        if (isFilteringByFavorites) {
            // Turn off favorite filter
            setIsFilteringByFavorites(false)
            setSportFilter('all')
            setFilters((prev) => {
                const copy: any = { ...prev }
                delete copy.sportTypes
                delete copy.sportType
                copy.page = 1
                return copy
            })
        } else {
            // Turn on favorite filter
            if (favouriteSports.length > 0) {
                setIsFilteringByFavorites(true)
                setSportFilter('all')
                setFilters((prev) => ({
                    ...prev,
                    sportTypes: favouriteSports,
                    page: 1
                } as any))
            }
        }
    }

    useEffect(() => {
        setFilters((prev) => {
            const prevAny: any = prev
            const sameSort = (!!prevAny.sortBy && prevAny.sortBy === 'price') === !!priceSort &&
                (priceSort ? prevAny.sortOrder === priceSort : !prevAny.sortOrder)
            if (sameSort && prev.page === 1) return prev

            const copy: any = { ...prevAny }
            delete copy.sortBy
            delete copy.sortOrder
            if (priceSort && priceSort !== 'none') {
                copy.sortBy = 'price'
                copy.sortOrder = priceSort
            }
            copy.page = 1
            return copy
        })

        if (isNearbyMode) return

        const base: any = {}
        if (nameFilter?.trim()) base.name = nameFilter.trim()
        if (sportFilter !== 'all') base.sportType = sportFilter
        if (timeFilter !== 'any') base.weekday = timeFilter
        if (locationFilter?.trim()) base.location = locationFilter.trim()
        if (priceSort && priceSort !== 'none') {
            base.sortBy = 'price'
            base.sortOrder = priceSort
        }
        base.page = 1
        base.limit = 10
        skipNextDebounceRef.current = true
        dispatch(getAllFields(base))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceSort, isNearbyMode])

    const location = useLocation()
    const navigate = useNavigate()
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search)
            const qType = params.get('type') || ''
            const qLocation = params.get('location') || params.get('loc') || ''
            const qName = params.get('name') || ''
            const qWeekday = params.get('weekday') || params.get('time') || ''

            setFilters((prev) => ({ ...prev, type: qType, sportType: qType, location: qLocation, page: 1 }))
            setNameFilter(qName)
            setSportFilter(qType || 'all')
            setTimeFilter(qWeekday || 'any')
            setLocationFilter(qLocation)
        } catch (error: any) {
            console.error('Error reading query params:', error)
        }
    }, [location.search])

    useEffect(() => {
        setFilters((prev) => {
            const copy: any = { ...prev }
            if (nameFilter?.trim()) {
                copy.name = nameFilter.trim()
            } else {
                delete copy.name
            }
            
            // Handle sport filtering - priority: manual selection > favorites
            if (isFilteringByFavorites && favouriteSports.length > 0 && sportFilter === 'all') {
                // Use favorite sports
                copy.sportTypes = favouriteSports
                delete copy.sportType
                delete copy.type
            } else if (sportFilter !== 'all') {
                // User selected specific sport - override favorites
                copy.type = sportFilter
                copy.sportType = sportFilter
                delete copy.sportTypes
                setIsFilteringByFavorites(false)
            } else {
                // No filter
                delete copy.type
                delete copy.sportType
                delete copy.sportTypes
            }
            
            if (timeFilter !== 'any') {
                copy.weekday = timeFilter
            } else {
                delete copy.weekday
            }
            if (locationFilter?.trim()) {
                copy.location = locationFilter.trim()
            } else {
                delete copy.location
            }
            copy.page = 1
            return copy
        })
    }, [nameFilter, sportFilter, timeFilter, locationFilter, isFilteringByFavorites, favouriteSports])

    const hasActiveFilters = !!(nameFilter || (sportFilter !== 'all') || (timeFilter !== 'any') || locationFilter || (priceSort && priceSort !== 'none') || isNearbyMode)

    const forceSyncFilters = () => {
        const currentNameValue = nameInputRef.current?.value.trim() || ''
        const currentLocationValue = locationInputRef.current?.value.trim() || ''
        
        if (currentNameValue !== nameFilter) setNameFilter(currentNameValue)
        if (currentLocationValue !== locationFilter) setLocationFilter(currentLocationValue)
        
        setFilters((prev) => {
            const copy: any = { ...prev }
            if (currentNameValue) copy.name = currentNameValue
            else delete copy.name
            if (currentLocationValue) copy.location = currentLocationValue.trim()
            else delete copy.location
            if (sportFilter !== 'all') {
                copy.type = sportFilter
                copy.sportType = sportFilter
            } else {
                delete copy.type
                delete copy.sportType
            }
            if (timeFilter !== 'any') copy.weekday = timeFilter
            else delete copy.weekday
            copy.page = 1
            return copy
        })
        
        if (!isNearbyMode) {
            const base: any = {}
            if (currentNameValue) base.name = currentNameValue
            if (currentLocationValue) base.location = currentLocationValue.trim()
            if (sportFilter !== 'all') base.sportType = sportFilter
            if (timeFilter !== 'any') base.weekday = timeFilter
            if (priceSort && priceSort !== 'none') {
                base.sortBy = 'price'
                base.sortOrder = priceSort
            }
            base.page = 1
            base.limit = 10
            skipNextDebounceRef.current = true
            dispatch(getAllFields(base))
        }
    }

    const transformedFields = ((isNearbyMode && nearbyFields.length > 0) ? nearbyFields : fields).map((field) => {
        const rawLocation: any = (field as any).location ?? (field as any).address
        let locationText = 'Địa chỉ không xác định'
        if (typeof rawLocation === 'string' && rawLocation.trim()) {
            locationText = rawLocation
        } else if (rawLocation && typeof rawLocation === 'object') {
            const address = (rawLocation as any).address
            const geo = (rawLocation as any).geo
            const lat = geo?.latitude ?? geo?.lat
            const lng = geo?.longitude ?? geo?.lng
            if (typeof address === 'string' && address.trim()) {
                locationText = address
            } else if (lat != null && lng != null) {
                locationText = `${lat}, ${lng}`
            }
        }

        const fieldImages = (field as any).images
        const hasValidImages = Array.isArray(fieldImages) && fieldImages.length > 0
        const imageUrl = !hasValidImages 
            ? '/general-img-portrait.png'
            : ((field as any).imageUrl || fieldImages[0] || '/general-img-portrait.png')

        return {
            id: (field as any).id,
            name: (field as any).name,
            location: locationText,
            description: (field as any).description || 'Mô tả không có sẵn',
            rating: (field as any).rating || 4.5,
            reviews: (field as any).reviews || (field as any).totalBookings || 0,
            price: (field as any).price || 'N/A',
            nextAvailability: (field as any).isActive !== false ? 'Có sẵn' : 'Không có sẵn',
            sportType: (field as any).sportType || 'unknown',
            imageUrl,
            distance: (field as any).distance ? `${(field as any).distance.toFixed(1)} km` : undefined,
            latitude: (field as any).latitude ?? (field as any).lat ?? (field as any)?.geo?.lat ?? (field as any)?.geo?.latitude,
            longitude: (field as any).longitude ?? (field as any).lng ?? (field as any)?.geo?.lng ?? (field as any)?.geo?.longitude,
        }
    })

    const urlParams = new URLSearchParams(location.search)
    const qName = (urlParams.get('name') || '').toLowerCase()
    const qType = (urlParams.get('type') || '').toLowerCase()
    const qLocation = (urlParams.get('location') || urlParams.get('loc') || '').toLowerCase()

    const filteredTransformedFields = transformedFields.filter((f) => {
        if (qName) {
            const inName = (f.name || '').toLowerCase().includes(qName)
            const inLocation = (f.location || '').toLowerCase().includes(qName)
            if (!inName && !inLocation) return false
        }
        if (qType && !(f.sportType || '').toLowerCase().includes(qType)) return false
        if (qLocation && !(f.location || '').toLowerCase().includes(qLocation)) return false
        return true
    })

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
            } catch (error: any) {
                console.error('Failed to initialize map', error)
            }
        })()
    }, [])

    useEffect(() => {
        const L: any = (window as any).L
        if (!L || !mapRef.current) return

        // Fix default marker icon
        const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
        L.Marker.prototype.options.icon = defaultIcon

        markersRef.current.forEach((m) => m.remove && m.remove())
        markersRef.current = []
        const bounds = L.latLngBounds([])

        if (userLocation?.lat && userLocation?.lng) {
            const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 6,
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.9,
            }).addTo(mapRef.current)
            userMarker.bindPopup("Vị trí của bạn")
            markersRef.current.push(userMarker)
            bounds.extend([userLocation.lat, userLocation.lng])
        }

        filteredTransformedFields.forEach((f) => {
            if (f.latitude != null && f.longitude != null) {
                const marker = L.marker([f.latitude, f.longitude], {
                    icon: defaultIcon
                }).addTo(mapRef.current)
                const popupHtml = `
                    <div style="min-width: 160px">
                        <div style="font-weight:600;margin-bottom:4px">${f.name}</div>
                        <div style="font-size:12px;color:#4b5563;">${f.location}</div>
                        ${f.price ? `<div style="font-size:12px;margin-top:4px;color:#065f46">Giá: ${f.price}</div>` : ''}
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
    }, [filteredTransformedFields, userLocation])

    return (
        <div className="min-h-screen">
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scroll-snap-start {
                    scroll-snap-align: start;
                }
                .custom-scroll-container {
                    scroll-behavior: smooth;
                    overflow-y: auto;
                }
                .map-container {
                    position: sticky;
                    top: 80px;
                    height: calc(100vh);
                    overflow: hidden;
                    z-index: 10;
                }
            `}</style>
            <NavbarDarkComponent />
            <PageWrapper>
                <div className="flex flex-row">
                    <div className="w-full flex-6">
                        <div className="items-start">
                            <div className="bg-background-secondary flex flex-col h-screen p-4">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 flex items-center gap-3 flex-wrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <Filter className="w-4 h-4" />
                                                Thêm bộ lọc
                                            </Button>
                                            {geolocationSupported && (
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
                                            )}
                                            {authUser && favouriteSports.length > 0 && (
                                                <Button
                                                    variant={isFilteringByFavorites ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={handleToggleFavoriteFilter}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Heart className={`w-4 h-4 ${isFilteringByFavorites ? 'fill-current' : ''}`} />
                                                    {isFilteringByFavorites ? 'Đang hiển thị sân yêu thích' : 'Sân yêu thích của tôi'}
                                                </Button>
                                            )}
                                            <Input
                                                ref={nameInputRef}
                                                className="w-[140px]" 
                                                placeholder="Tên sân" 
                                                value={nameFilter} 
                                                onChange={(e) => setNameFilter(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setNameFilter((e.target as HTMLInputElement).value.trim())
                                                    }
                                                }}
                                            />
                                            <Input 
                                                ref={locationInputRef}
                                                className="w-[140px]" 
                                                placeholder="Địa điểm" 
                                                value={locationFilter} 
                                                onChange={(e) => setLocationFilter(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setLocationFilter((e.target as HTMLInputElement).value.trim())
                                                    }
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600 whitespace-nowrap">Thể loại:</span>
                                                <Select value={sportFilter} onValueChange={setSportFilter}>
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue placeholder="Loại thể thao" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Tất cả</SelectItem>
                                                        <SelectItem value="football">Bóng đá</SelectItem>
                                                        <SelectItem value="tennis">Quần vợt</SelectItem>
                                                        <SelectItem value="badminton">Cầu lông</SelectItem>
                                                        <SelectItem value="basketball">Bóng rổ</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {!geolocationSupported && (
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
                                                        try {
                                                            navigate(location.pathname, { replace: true })
                                                        } catch (error: any) {
                                                            console.error('Error navigating:', error)
                                                        }
                                                    }}
                                                    variant="outline"
                                                    className="px-3 py-2"
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
                                    {isFilteringByFavorites && favouriteSports.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span>Đang hiển thị {favouriteSports.length} môn thể thao yêu thích: {favouriteSports.join(', ')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <FilterSidebar
                                    isOpen={isSidebarOpen}
                                    onOpenChange={setIsSidebarOpen}
                                    timeFilter={timeFilter}
                                    onTimeFilterChange={setTimeFilter}
                                    priceSort={priceSort}
                                    onPriceSortChange={setPriceSort}
                                    hasActiveFilters={hasActiveFilters}
                                    onResetFilters={() => {
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
                                        try {
                                            navigate(location.pathname, { replace: true })
                                        } catch (error: any) {
                                            console.error('Error navigating:', error)
                                        }
                                    }}
                                />

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
                                                        onBookNow={forceSyncFilters}
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
