import React from "react"
import { Card, CardContent } from "@/components/ui/card"

type Pill = { k: string; label: string }

interface QuickNavPillsProps {
  activeTab: string
  pills: Pill[]
  onSelect: (key: string) => void
}

export const QuickNavPills: React.FC<QuickNavPillsProps> = ({ activeTab, pills, onSelect }) => {
  return (
    <Card className="sticky top-16 z-10 bg-white shadow-md rounded-lg">
      <CardContent className="py-2 overflow-x-auto">
        <div className="flex gap-2 justify-start">
          {pills.map((i) => (
            <button
              key={i.k}
              onClick={() => onSelect(i.k)}
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                activeTab === i.k ? "bg-[#1a2332] text-white border-[#1a2332]" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickNavPills


