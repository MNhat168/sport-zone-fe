import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Booking interface matching the UI requirements
export interface BookingRow {
  id: string;
  academyName: string;
  courtName?: string;
  courtNumber?: number;
  academyImage: string;
  date: string;
  time: string;
  payment: string;
  status: "awaiting" | "accepted" | "rejected" | "completed";
  statusText: string;
  transactionStatus?: string;
  approvalStatus?: string;
  createdAt?: string;
  isOwnerReserved?: boolean; // Flag for owner-reserved bookings
  // Original data for actions
  originalBooking?: unknown;
}

// Status badge styles
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

// Convert 12h time to 24h format
const convertTo24Hour = (time12h: string): string => {
  const parts = time12h.split(" - ");
  if (parts.length !== 2) return time12h;

  const convertSingleTime = (timeStr: string): string => {
    const trimmed = timeStr.trim();
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return trimmed;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  return `${convertSingleTime(parts[0])} - ${convertSingleTime(parts[1])}`;
};

// Format createdAt to Vietnamese date
const formatCreatedAt = (createdAt: string): string => {
  try {
    const date = parseISO(createdAt);
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return createdAt;
  }
};

// Props for action handlers
export interface BookingColumnsActions {
  onViewDetails: (bookingId: string) => void;
  onAccept?: (bookingId: string) => void;
  onDeny?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

// Create columns with action handlers
export function createBookingColumns(
  actions: BookingColumnsActions
): ColumnDef<BookingRow>[] {
  return [
    {
      id: "academyName",
      accessorKey: "academyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên Sân" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-base font-medium text-gray-900">
            {row.original.academyName}
          </span>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue?.toLowerCase().includes(value?.toLowerCase() ?? "");
      },
      meta: { className: "w-80" },
    },
    {
      id: "courtName",
      accessorKey: "courtName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sân con" />
      ),
      cell: ({ row }) => {
        const displayValue =
          row.original.courtName ||
          (row.original.courtNumber
            ? `Court ${row.original.courtNumber}`
            : "—");
        return <span className="text-sm text-gray-900">{displayValue}</span>;
      },
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const courtName = row.original.courtName || "";
        const courtNumber = row.original.courtNumber
          ? `Court ${row.original.courtNumber}`
          : "";
        const displayValue = courtName || courtNumber || "";
        return displayValue
          ?.toLowerCase()
          .includes(value?.toLowerCase() ?? "");
      },
      meta: { className: "w-48" },
    },
    {
      id: "date",
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày & Giờ" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-900">{row.original.date}</span>
          <span className="text-sm text-gray-900 pt-1">
            {convertTo24Hour(row.original.time)}
          </span>
        </div>
      ),
      enableSorting: true,
      meta: { className: "w-96" },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày Tạo" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.createdAt
            ? formatCreatedAt(row.original.createdAt)
            : "—"}
        </span>
      ),
      enableSorting: true,
      meta: { className: "w-40" },
    },
    {
      id: "payment",
      accessorKey: "payment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Thanh Toán" />
      ),
      cell: ({ row }) => (
        <span className="text-base font-medium text-gray-900">
          {row.original.payment}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue?.toLowerCase().includes(value?.toLowerCase() ?? "");
      },
      meta: { className: "w-32" },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng Thái" />
      ),
      cell: ({ row }) => {
        const isOwnerReserved = row.original.isOwnerReserved === true;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`${getStatusBadgeStyles(row.original.status)} rounded-sm`}
            >
              {row.original.statusText}
            </Badge>
            {isOwnerReserved && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-sm border-gray-300"
                title="Đã khóa bởi chủ sân"
              >
                🔒 Chủ sân
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      meta: { className: "w-32" },
    },
    {
      id: "details",
      header: "Chi Tiết",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-0 h-auto font-normal"
          onClick={() => actions.onViewDetails(row.original.id)}
        >
          Xem Chi Tiết
        </Button>
      ),
      enableSorting: false,
      meta: { className: "w-36" },
    },
    {
      id: "actions",
      header: "Hành Động",
      cell: ({ row }) => {
        const booking = row.original;

        if (booking.status === "awaiting") {
          // Only show Accept/Deny if handlers are provided
          if (actions.onAccept || actions.onDeny) {
            return (
              <div className="flex items-center gap-2">
                {actions.onAccept && (
                  <Button
                    type="button"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white h-8"
                    onClick={() => actions.onAccept?.(booking.id)}
                  >
                    Chấp Nhận
                  </Button>
                )}
                {actions.onDeny && (
                  <Button
                    type="button"
                    variant="default"
                    className="h-8 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => actions.onDeny?.(booking.id)}
                  >
                    Từ Chối
                  </Button>
                )}
              </div>
            );
          }
          // If no Accept/Deny handlers, show Cancel button if available
          if (actions.onCancel) {
            return (
              <Button
                type="button"
                variant="destructive"
                className="h-8 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => actions.onCancel?.(booking.id)}
              >
                Hủy Đặt
              </Button>
            );
          }
        }

        if (booking.status === "accepted") {
          return (
            <Button
              type="button"
              variant="destructive"
              className="h-8 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => actions.onCancel?.(booking.id)}
            >
              Hủy Đặt
            </Button>
          );
        }

        return <div className="text-sm text-gray-500">Không có hành động</div>;
      },
      enableSorting: false,
      meta: { className: "w-48" },
    },
  ];
}
