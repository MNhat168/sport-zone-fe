import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown, Check } from "lucide-react"

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
          <CardTitle className="text-base md:text-lg">Tiện ích</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent>
            {items.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {items.map((a) => (
                  <div key={a.key} className="flex items-center gap-2">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{a.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {(fallback || []).map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{a}</span>
                  </div>
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
