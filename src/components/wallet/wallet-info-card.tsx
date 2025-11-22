import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface WalletInfoCardProps {
  title: string
  items: Array<{ label: string; description: string }>
  icon?: ReactNode
  footer?: ReactNode
}

export const WalletInfoCard = ({
  title,
  items,
  icon,
  footer,
}: WalletInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b bg-muted/40">
        {icon}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-6">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.label}>
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="mt-1 leading-relaxed">{item.description}</p>
            </li>
          ))}
        </ul>
        {footer}
      </CardContent>
    </Card>
  )
}

