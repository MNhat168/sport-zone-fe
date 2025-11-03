import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

interface AmenityItem { key: string; label: string }

interface AmenitiesCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  items: AmenityItem[]
  fallback?: string[]
}

export const AmenitiesCard: React.FC<AmenitiesCardProps> = ({ refObj, id, items, fallback }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Amenities</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6">
            {items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {items.map((a) => (
                  <Badge key={a.key} variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                    {a.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(fallback || []).map((a, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default AmenitiesCard


