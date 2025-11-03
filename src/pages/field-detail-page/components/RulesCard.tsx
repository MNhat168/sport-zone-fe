import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

interface RulesCardProps {
  refObj: React.RefObject<HTMLDivElement | null>
  id: string
  rules: string[]
}

export const RulesCard: React.FC<RulesCardProps> = ({ refObj, id, rules }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <Card ref={refObj as any} id={id} className="shadow-md border-0 bg-white">
      <CardHeader onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">Rules</CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <hr className="border-t border-gray-300 my-0 mx-6" />
          <CardContent className="pt-6">
            {rules.length > 0 ? (
              <ul className="space-y-2">
                {rules.map((r, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <span className="text-red-500 font-bold flex-shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Chưa cập nhật nội quy.</p>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default RulesCard


