import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import type { ReactNode } from "react"

interface WalletEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export const WalletEmptyState = ({
  title,
  description,
  action,
}: WalletEmptyStateProps) => {
  return (
    <Card className="border-dashed border-emerald-200 bg-emerald-50/40">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Wallet className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-emerald-700">{title}</h3>
          <p className="text-sm text-emerald-700/80">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

