import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/format-currency"
import type { ReactNode } from "react"

interface WalletSummaryCardProps {
  title: string
  amount: number
  currency?: string
  message?: string
  icon?: ReactNode
  loading?: boolean
  className?: string
}

export const WalletSummaryCard = ({
  title,
  amount,
  currency = "VND",
  message,
  icon,
  loading,
  className,
}: WalletSummaryCardProps) => {
  return (
    <Card className={cn("border border-emerald-100 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <p className="text-3xl font-semibold text-emerald-600">
            {formatCurrency(amount, currency)}
          </p>
        )}
        {message && (
          <p className="text-xs text-muted-foreground leading-snug">{message}</p>
        )}
      </CardContent>
    </Card>
  )
}

