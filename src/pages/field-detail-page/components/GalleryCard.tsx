import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface GalleryCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  images: string[]
  fallback: string[]
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ refObj, id, images, fallback }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Gallery</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6">
            {images.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img || "/placeholder.svg"}
                    className="w-full h-40 object-cover rounded-md"
                    alt={`Ảnh ${idx + 1}`}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.jpg"
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {fallback.map((img, idx) => (
                  <img
                    key={idx}
                    src={img || "/placeholder.svg"}
                    className="w-full h-40 object-cover rounded-md"
                    alt={`Ảnh ${idx + 1}`}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.jpg"
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default GalleryCard


