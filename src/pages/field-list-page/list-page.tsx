"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import FieldCard from "./card-list/field-card-props"
import { useRef, useEffect, useState } from "react"
import { FooterComponent } from "../../components/footer/footer-component"
import { useAppDispatch, useAppSelector } from "../../store/hook"
import { getAllFields } from "../../features/field/fieldThunk"
import { getUserProfile, setFavouriteSports } from "../../features/user/userThunk"
import { useGeolocation } from "../../hooks/useGeolocation"
import { locationAPIService } from "../../utils/geolocation"
import { Navigation, MapPin, AlertCircle, Filter } from "lucide-react"
import { FavoriteSportsModal } from "../../components/common/favorite-sports-modal"

const FieldBookingPage = () => {
  const fieldsListRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [showFavoriteSportsModal, setShowFavoriteSportsModal] = useState(false);
  const [modalShownOnce, setModalShownOnce] = useState(false);
  const user = useAppSelector((state) => state.user.user);
  const isLoggedIn = !!user;

  // Redux state
  const { fields, loading, error, pagination } = useAppSelector(
    (state) => state.field
  );

  // Filter states
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    page: 1,
    limit: 10,
  });

    // Geolocation states
    const {
        error: geolocationError,
        loading: geolocationLoading,
        supported: geolocationSupported,
        getCoordinates
    } = useGeolocation()
    
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [nearbyFields, setNearbyFields] = useState<any[]>([])
    const [isLoadingNearby, setIsLoadingNearby] = useState(false)
    const [isNearbyMode, setIsNearbyMode] = useState(false)

  // Leaflet map refs
  const mapContainerId = "fields-map-container";
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Đặt sân thể thao" },
  ];

  // Geolocation functions
  const handleGetLocation = async () => {
    try {
      console.log("📍 [FIELD LIST] Getting user location...");
      const coordinates = await getCoordinates();

      if (coordinates && coordinates.lat && coordinates.lng) {
        setUserLocation(coordinates as { lat: number; lng: number });
        console.log("✅ [FIELD LIST] Location obtained:", coordinates);

        // Get nearby fields
        await getNearbyFields(coordinates.lat, coordinates.lng);
      } else {
        console.log("❌ [FIELD LIST] Failed to get coordinates");
      }
    } catch (error) {
      console.error("❌ [FIELD LIST] Error getting location:", error);
    }
  };

  const getNearbyFields = async (lat: number, lng: number) => {
    setIsLoadingNearby(true);
    try {
      console.log("🔍 [FIELD LIST] Getting nearby fields for:", { lat, lng });

      const result = await locationAPIService.getNearbyFields({
        latitude: lat,
        longitude: lng,
        radius: 10, // 10km radius
        limit: 20,
      });

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
      if (isNearbyMode) return;
      dispatch(getAllFields(filters));
    }, 500); // 500ms delay for debouncing

        return () => clearTimeout(timeoutId)
    }, [dispatch, filters, isNearbyMode])

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
        const formattedPrice = (field as any).price || `${(field as any).basePrice || 0}k/h`;

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
    transformedFields.forEach((f) => {
      if (f.latitude != null && f.longitude != null) {
        const marker = L.marker([f.latitude, f.longitude]).addTo(
          mapRef.current
        );
        const popupHtml = `
                    <div style="min-width: 160px">
                        <div style="font-weight:600;margin-bottom:4px">${
                          f.name
                        }</div>
                        <div style="font-size:12px;color:#4b5563;">${
                          f.location
                        }</div>
                        ${
                          f.price
                            ? `<div style="font-size:12px;margin-top:4px;color:#065f46">Giá: ${f.price}</div>`
                            : ""
                        }
                    </div>
                `;
        marker.bindPopup(popupHtml);
        markersRef.current.push(marker);
        bounds.extend([f.latitude, f.longitude]);
      }
    });

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  }, [transformedFields, userLocation]);

  // Show modal if user is logged in and has no favouriteSports
  useEffect(() => {
    if (
      isLoggedIn &&
      !modalShownOnce &&
      (!user?.favouriteSports || user.favouriteSports.length === 0)
    ) {
      setShowFavoriteSportsModal(true);
      setModalShownOnce(true);
    }
  }, [isLoggedIn, user, modalShownOnce]);

  // Debug log to inspect user.favouriteSports value after login/profile fetch
  useEffect(() => {
    if (isLoggedIn) {
      console.log("DEBUG user.favouriteSports:", user?.favouriteSports);
    }
  }, [isLoggedIn, user]);

  const handleFavoriteSportsAccept = (selectedSports: string[]) => {
    if (!user) return;
    dispatch(setFavouriteSports({ favouriteSports: selectedSports }))
      .unwrap()
      .then(() => {
        // Refetch profile to update Redux state
        dispatch(getUserProfile());
        setShowFavoriteSportsModal(false);
      })
      .catch(() => {
        setShowFavoriteSportsModal(false);
      });
  };
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
        <PageHeader title="Đặt sân thể thao" breadcrumbs={breadcrumbs} />
      </div>
      <FavoriteSportsModal
        isOpen={showFavoriteSportsModal}
        onClose={() => setShowFavoriteSportsModal(false)}
        onAccept={handleFavoriteSportsAccept}
      />
      {/* Main container with flexbox layout */}
      <div className="px-4 min-h-screen">
        <div className="flex gap-6 items-start">
          {/* Left Panel - Fields List */}
          <div className="flex-[6] bg-white flex flex-col h-screen">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              {/* Geolocation Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Tìm sân gần tôi
                    </h3>

                    {geolocationSupported ? (
                      <button
                        onClick={handleGetLocation}
                        disabled={geolocationLoading || isLoadingNearby}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {geolocationLoading || isLoadingNearby ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {isLoadingNearby
                              ? "Đang tìm..."
                              : "Đang lấy vị trí..."}
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
                          {userLocation.lat.toFixed(4)},{" "}
                          {userLocation.lng.toFixed(4)}
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

                  {isNearbyMode && nearbyFields.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Đã tìm thấy {nearbyFields.length} sân gần vị trí của bạn
                      </span>
                      <button
                        onClick={() => {
                          setIsNearbyMode(false);
                          setNearbyFields([]);
                          // Trigger reload of normal list
                          dispatch(getAllFields({ ...filters }));
                        }}
                        className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        Tắt sân gần tôi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={fieldsListRef}
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{
                scrollBehavior: "smooth",
                scrollSnapType: "y mandatory",
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

              {!loading &&
                !isLoadingNearby &&
                !error &&
                transformedFields.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy sân thể thao nào.
                    </p>
                  </div>
                )}

              {!loading && !error && transformedFields.length > 0 && (
                <div className="space-y-4">
                  {transformedFields.map((field, index) => (
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

              {!loading &&
                !isLoadingNearby &&
                !isNearbyMode &&
                pagination &&
                pagination.total > filters.limit && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={filters.page === 1}
                      className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700"
                    >
                      Trang trước
                    </button>
                    <span className="px-4 py-2 bg-gray-100 rounded">
                      Trang {filters.page} /{" "}
                      {Math.ceil(pagination.total / filters.limit)}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={
                        filters.page >=
                        Math.ceil(pagination.total / filters.limit)
                      }
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
              <div
                id={mapContainerId}
                className="absolute h-full w-full p-0 border-0 m-0 left-0 top-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer để đảm bảo có thể scroll */}
      <FooterComponent />
    </div>
  );
};

export default FieldBookingPage;
