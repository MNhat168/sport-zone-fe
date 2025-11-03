import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface OverviewCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  description: string
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ refObj, id, description }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Overview</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default OverviewCard


