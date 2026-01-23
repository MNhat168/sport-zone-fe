import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, Eye } from "lucide-react";
import type { BookingRow } from "./booking-columns";

interface BookingMobileCardProps {
  booking: BookingRow;
  onViewDetails: (bookingId: string) => void;
  onAccept?: (bookingId: string) => void;
  onDeny?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

// Status badge styles matching booking-columns.tsx
const getStatusBadgeStyles = (status: BookingRow["status"]) => {
  switch (status) {
    case "awaiting":
      return "bg-violet-100 text-violet-600 hover:bg-violet-200";
    case "accepted":
    case "completed":
      return "bg-green-100 text-green-600 hover:bg-green-200";
    case "rejected":
      return "bg-red-100 text-red-600 hover:bg-red-200";
    default:
      return "";
  }
};

export function BookingMobileCard({
  booking,
  onViewDetails,
  onAccept,
  onDeny,
  onCancel,
}: BookingMobileCardProps) {
  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header: Image and Field Name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <img
              src={booking.academyImage || "/placeholder.svg"}
              alt={booking.academyName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {booking.academyName}
            </h3>
            {booking.courtName && (
              <p className="text-sm text-gray-600">
                {booking.courtName}
              </p>
            )}
            {!booking.courtName && booking.courtNumber && (
              <p className="text-sm text-gray-600">
                Sân {booking.courtNumber}
              </p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mb-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900 font-medium">{booking.date}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900">{booking.time}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-900 font-semibold">{booking.payment}</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 pt-1">
            <Badge
              variant="secondary"
              className={`${getStatusBadgeStyles(booking.status)} rounded-sm text-xs`}
            >
              {booking.statusText}
            </Badge>
            {booking.isOwnerReserved && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-sm border-gray-300 text-xs"
                title="Đã khóa bởi chủ sân"
              >
                🔒 Chủ sân
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-blue-600 border-blue-500 hover:bg-blue-50 hover:text-blue-700 h-10"
            onClick={() => onViewDetails(booking.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Button>

          {booking.status === "awaiting" && (onAccept || onDeny) && (
            <>
              {onAccept && (
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10"
                  onClick={() => onAccept(booking.id)}
                >
                  Chấp nhận
                </Button>
              )}
              {onDeny && (
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10"
                  onClick={() => onDeny(booking.id)}
                >
                  Từ chối
                </Button>
              )}
            </>
          )}

          {booking.status === "awaiting" && !onAccept && !onDeny && onCancel && (
            <Button
              type="button"
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10"
              onClick={() => onCancel(booking.id)}
            >
              Hủy đặt
            </Button>
          )}

          {booking.status === "accepted" && onCancel && (
            <Button
              type="button"
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10"
              onClick={() => onCancel(booking.id)}
            >
              Hủy đặt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
