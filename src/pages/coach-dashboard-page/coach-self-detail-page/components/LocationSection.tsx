import { useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, Search } from "lucide-react";
import { VIETNAM_CITIES } from "@/utils/constant-value/constant";

interface LocationSectionProps {
  location: string;
  locationCoordinates: [number, number] | null;
  isEditMode: boolean;
  isSearching: boolean;
  selectedCity?: string;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  onLocationChange: (value: string) => void;
  onSearchLocation: () => void;
  onCitySelect?: (city: string) => void;
}

export function LocationSection({
  location,
  locationCoordinates,
  isEditMode,
  isSearching,
  selectedCity = 'all',
  mapContainerRef,
  onLocationChange,
  onSearchLocation,
  onCitySelect,
}: LocationSectionProps) {
  // Load Leaflet CSS dynamically (same approach as other pages)
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'leaflet-css';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleOpenGoogleMaps = () => {
    if (locationCoordinates) {
      window.open(`https://www.google.com/maps?q=${locationCoordinates[0]},${locationCoordinates[1]}`, '_blank');
    } else if (location) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(location)}`, '_blank');
    }
  };

  return (
    <Card
      id="location"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Vị trí</CardTitle>
          {!isEditMode && (
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-green-50 hover:border-green-500 bg-transparent"
              onClick={handleOpenGoogleMaps}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Chỉ đường
            </Button>
          )}
        </div>
        <hr className="my-2 border-gray-200 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode && (
          <div className="space-y-2">
            <Label>Địa chỉ <span className="text-red-600">*</span></Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Select
                  value={selectedCity}
                  onValueChange={onCitySelect}
                  disabled={isSearching}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn tỉnh/thành" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[10000]">
                    <SelectItem value="all">Tất cả khu vực</SelectItem>
                    {VIETNAM_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Nhập địa chỉ đầy đủ"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSearchLocation();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onSearchLocation}
                disabled={!location.trim() || isSearching}
                className="px-4"
              >
                {isSearching ? (
                  <Loading size={16} />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {locationCoordinates && (
              <p className="text-xs text-muted-foreground">
                Tọa độ: {locationCoordinates[0].toFixed(6)}, {locationCoordinates[1].toFixed(6)}
              </p>
            )}
          </div>
        )}
        <div className="h-96 rounded-lg relative overflow-hidden border border-gray-200 bg-gray-50">
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full z-10"
            style={{
              minHeight: '384px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

