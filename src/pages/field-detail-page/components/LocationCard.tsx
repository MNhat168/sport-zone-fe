import React, { useEffect, useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation, ChevronDown } from "lucide-react"
import L from "leaflet"

interface LocationCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  addressText: string
  geoCoords?: [number, number] | null // [lng, lat]
}

export const LocationCard: React.FC<LocationCardProps> = ({ refObj, id, addressText, geoCoords }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.id = "leaflet-css"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }
  }, [])

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

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      ;(L as any).Marker.prototype.options.icon = defaultIcon

      mapRef.current = map
      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 300)
      setTimeout(() => map.invalidateSize(), 500)
    }

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
    let lat: number | null = null
    let lon: number | null = null
    if (geoCoords && Number.isFinite(geoCoords[0]) && Number.isFinite(geoCoords[1])) {
      lon = geoCoords[0]
      lat = geoCoords[1]
    }
    if (lat == null || lon == null) return
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lon]).addTo(map)
    } else {
      markerRef.current.setLatLng([lat, lon])
    }
    map.flyTo([lat, lon], Math.max(map.getZoom(), 14), { duration: 1.0 })
  }, [geoCoords])

  const handleOpenMaps = () => {
    if (geoCoords) {
      const [lng, lat] = geoCoords
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
      return
    }
    if (addressText) window.open(`https://www.google.com/maps/search/${encodeURIComponent(addressText)}`, "_blank")
  }

  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white scroll-mt-24">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Vị trí</CardTitle>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-500 bg-transparent" onClick={(e) => { e.stopPropagation(); handleOpenMaps(); }}>
              <Navigation className="h-4 w-4 mr-2" />
              Chỉ đường
            </Button>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6 space-y-4">
            <div className="h-96 rounded-lg relative overflow-hidden border border-gray-200 bg-gray-50">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" style={{ minHeight: "384px", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default LocationCard


