import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Mail } from "lucide-react"

interface OwnerInfoCardProps {
  name: string
  phone?: string
  email?: string
  avatarUrl?: string
}

export const OwnerInfoCard: React.FC<OwnerInfoCardProps> = ({
  name,
  phone,
  email,
  avatarUrl,
}) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "O"

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-gray-800">Thông tin chủ sân</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          {phone && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{phone}</span>
            </p>
          )}
          {email && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{email}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OwnerInfoCard


