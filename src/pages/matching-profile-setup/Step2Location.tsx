import React, { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import logger from '@/utils/logger';

const GENDER_PREFERENCES = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'any', label: 'Bất kỳ' },
];

interface Step2LocationProps {
    formData: {
        location: {
            address: string;
            coordinates: [number, number];
            searchRadius: number;
        };
        preferredGender: string;
        minAge?: number;
        maxAge?: number;
    };
    onChange: (data: Partial<Step2LocationProps['formData']>) => void;
}

export const Step2Location: React.FC<Step2LocationProps> = ({ formData, onChange }) => {
    const mapContainerId = 'matching-location-map';
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const circleRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState(false);
    const [locationName, setLocationName] = useState<string>('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const { loading: geolocationLoading, getCoordinates } = useGeolocation();

    const handleRadiusChange = (value: number[]) => {
        onChange({
            location: {
                ...formData.location,
                searchRadius: value[0],
            },
        });
    };

    // Reverse geocoding to get location name from coordinates
    const reverseGeocode = async (lat: number, lng: number) => {
        setIsLoadingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.display_name) {
                setLocationName(data.display_name);
                // Update the address in formData
                onChange({
                    location: {
                        ...formData.location,
                        address: data.display_name,
                    },
                });
            }
        } catch (error) {
            logger.error('Error getting location name', error);
            setLocationName('Vị trí đã chọn');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleCoordinatesChange = (lat: number, lng: number) => {
        // Validate coordinates are valid numbers
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            logger.error('Invalid coordinates:', { lat, lng });
            return;
        }

        logger.debug('[Step2Location] Updating coordinates:', { lat, lng, formatted: [lng, lat] });
        
        onChange({
            location: {
                ...formData.location,
                coordinates: [lng, lat], // [longitude, latitude]
            },
        });
        
        // Get location name from coordinates
        reverseGeocode(lat, lng);
    };

    const handleGetLocation = async () => {
        try {
            logger.debug('[Step2Location] Getting current location...');
            const coords = await getCoordinates();
            logger.debug('[Step2Location] Received coordinates:', coords);
            
            if (coords?.lat && coords?.lng) {
                logger.debug('[Step2Location] Updating map and formData with coordinates:', coords);
                handleCoordinatesChange(coords.lat, coords.lng);
                if (mapRef.current) {
                    mapRef.current.setView([coords.lat, coords.lng], 14, { animate: true });
                }
            } else {
                logger.warn('[Step2Location] No coordinates received from getCoordinates');
            }
        } catch (error) {
            logger.error('Error getting location', error);
        }
    };

    // Initialize Leaflet map
    useEffect(() => {
        (async () => {
            try {
                const hasLeaflet = typeof (window as any).L !== 'undefined';
                if (!hasLeaflet) {
                    await new Promise<void>((resolve) => {
                        if (!document.getElementById('leaflet-css')) {
                            const link = document.createElement('link');
                            link.id = 'leaflet-css';
                            link.rel = 'stylesheet';
                            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
                            link.crossOrigin = '';
                            document.head.appendChild(link);
                        }
                        const scriptId = 'leaflet-js';
                        if (document.getElementById(scriptId)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement('script');
                        script.id = scriptId;
                        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
                        script.crossOrigin = '';
                        script.onload = () => resolve();
                        document.body.appendChild(script);
                    });
                }

                const L: any = (window as any).L;
                if (!mapRef.current) {
                    const container = document.getElementById(mapContainerId);
                    if (!container) return;

                    // Check if coordinates are valid (not [0, 0])
                    const currentCoords = formData.location?.coordinates;
                    const hasValidCoords = currentCoords && 
                        (currentCoords[0] !== 0 || currentCoords[1] !== 0);
                    
                    // Default to Ho Chi Minh City if no valid coordinates
                    const initialLat = hasValidCoords ? currentCoords[1] : 10.8231;
                    const initialLng = hasValidCoords ? currentCoords[0] : 106.6297;

                    // If coordinates are invalid, update formData to HCM default
                    if (!hasValidCoords) {
                        onChange({
                            location: {
                                ...formData.location,
                                coordinates: [106.6297, 10.8231],
                            },
                        });
                    }

                    mapRef.current = L.map(mapContainerId).setView([initialLat, initialLng], 12);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; OpenStreetMap contributors',
                    }).addTo(mapRef.current);

                    // Fix default marker icon
                    const defaultIcon = L.icon({
                        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                    });
                    L.Marker.prototype.options.icon = defaultIcon;

                    // Add click handler to map
                    mapRef.current.on('click', (e: any) => {
                        const { lat, lng } = e.latlng;
                        handleCoordinatesChange(lat, lng);
                    });

                    setMapReady(true);
                }
            } catch (error) {
                logger.error('Failed to initialize map', error);
            }
        })();
    }, []);

    // Load location name from existing address on mount
    useEffect(() => {
        if (formData.location?.address && !locationName) {
            setLocationName(formData.location.address);
        }
    }, [formData.location?.address, locationName]);

    // Update marker and circle when coordinates or radius change
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;

        const L: any = (window as any).L;
        if (!L) return;

        const lat = formData.location?.coordinates?.[1];
        const lng = formData.location?.coordinates?.[0];

        // Remove old marker and circle
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
        if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
        }

        // Add new marker if coordinates exist
        if (lat && lng && (lat !== 0 || lng !== 0)) {
            markerRef.current = L.marker([lat, lng], { draggable: true })
                .addTo(mapRef.current)
                .bindPopup('Vị trí của bạn');

            // Add circle for search radius
            const radiusInMeters = (formData.location?.searchRadius || 10) * 1000;
            circleRef.current = L.circle([lat, lng], {
                radius: radiusInMeters,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
            }).addTo(mapRef.current);

            // Update coordinates when marker is dragged
            markerRef.current.on('dragend', (e: any) => {
                const { lat, lng } = e.target.getLatLng();
                handleCoordinatesChange(lat, lng);
            });
        }
    }, [mapReady, formData.location?.coordinates, formData.location?.searchRadius]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Vị trí & Tìm kiếm</h2>
                <p className="text-slate-600">Thiết lập khu vực và đối tượng tìm kiếm của bạn</p>
            </div>

            {/* Location Name Display */}
            {locationName && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Vị trí đã chọn:</p>
                        <p className="text-sm text-blue-700">{locationName}</p>
                    </div>
                    {isLoadingLocation && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                </div>
            )}

            {/* Map */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Chọn vị trí trên bản đồ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <div
                        id={mapContainerId}
                        className="w-full h-[400px] rounded-lg border-2 border-slate-200"
                        style={{ zIndex: 1 }}
                    />
                    <Button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={geolocationLoading}
                        className="absolute top-3 right-3 z-[1000] bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-md"
                        size="sm"
                    >
                        {geolocationLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang lấy...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-4 h-4 mr-2" />
                                Vị trí của tôi
                            </>
                        )}
                    </Button>
                </div>
                <p className="text-sm text-slate-500 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Nhấp vào bản đồ để chọn vị trí hoặc kéo thả điểm đánh dấu để điều chỉnh</span>
                </p>
            </div>


            {/* Search Radius */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Bán kính tìm kiếm: {formData.location?.searchRadius || 10} km
                </Label>
                <Slider
                    value={[formData.location?.searchRadius || 10]}
                    onValueChange={handleRadiusChange}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>1 km</span>
                    <span>50 km</span>
                </div>
                <p className="text-sm text-slate-500">
                    Vòng tròn màu xanh trên bản đồ hiển thị khu vực tìm kiếm của bạn
                </p>
            </div>

            {/* Preferred Gender */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Giới tính ưu tiên <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500">Bạn muốn tìm bạn chơi là nam, nữ hay không quan trọng?</p>
                <div className="flex gap-3">
                    {GENDER_PREFERENCES.map(pref => (
                        <button
                            key={pref.value}
                            type="button"
                            onClick={() => onChange({ preferredGender: pref.value })}
                            className={cn(
                                'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                                formData.preferredGender === pref.value
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            {pref.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Age Range Preference */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Độ tuổi ưu tiên: {formData.minAge || 18} - {formData.maxAge || 100} tuổi
                </Label>
                <Slider
                    value={[formData.minAge || 18, formData.maxAge || 100]}
                    onValueChange={(values) => onChange({ minAge: values[0], maxAge: values[1] })}
                    min={18}
                    max={100}
                    step={1}
                    className="w-full"
                    minStepsBetweenThumbs={1}
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>18 tuổi</span>
                    <span>100 tuổi</span>
                </div>
                <p className="text-sm text-slate-500">
                    Kéo thanh trượt để chọn khoảng độ tuổi mong muốn
                </p>
            </div>
        </div>
    );
};
