import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { ChevronDown } from "lucide-react"

interface RatingCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  ratingValue: number
  reviewCount: number
}

export const RatingCard: React.FC<RatingCardProps> = ({ refObj, id, ratingValue, reviewCount }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Đánh giá</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold text-gray-900">{ratingValue.toFixed(1)}</div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(ratingValue) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-500 mt-2 text-sm">{reviewCount} lượt đánh giá</p>
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default RatingCard


