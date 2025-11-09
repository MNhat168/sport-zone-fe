import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Booking {
    id: string;
    academyName: string;
    courtName: string;
    academyImage: string;
    date: string;
    time: string;
    payment: string;
    status: "awaiting" | "accepted" | "rejected";
    statusText: string;
}

interface BookingTableProps {
    bookings: Booking[];
    onViewDetails: (bookingId: string) => void;
    onChat: (bookingId: string) => void;
}

const getStatusBadgeStyles = (status: Booking["status"]) => {
    switch (status) {
        case "awaiting":
            return "bg-violet-100 text-violet-600 hover:bg-violet-200";
        case "accepted":
            return "bg-green-100 text-green-600 hover:bg-green-200";
        case "rejected":
            return "bg-red-100 text-red-600 hover:bg-red-200";
        default:
            return "";
    }
};

export function BookingTable({
    bookings,
    onViewDetails,
    onChat
}: BookingTableProps) {
    return (
        <div className="w-full bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead className="w-80 font-semibold text-gray-900">
                                Tên Sân
                            </TableHead>
                            <TableHead className="w-96 font-semibold text-gray-900">
                                Ngày & Giờ
                            </TableHead>
                            <TableHead className="w-32 text-right font-semibold text-gray-900">
                                Thanh Toán
                            </TableHead>
                            <TableHead className="w-32 font-semibold text-gray-900">
                                Trạng Thái
                            </TableHead>
                            <TableHead className="w-36 font-semibold text-gray-900">
                                Chi Tiết
                            </TableHead>
                            <TableHead className="w-24 font-semibold text-gray-900">
                                Chat
                            </TableHead>
                            <TableHead className="w-16"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow key={booking.id} className="border-b hover:bg-gray-50">
                                <TableCell className="py-2">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-12 w-12 rounded-lg">
                                            <AvatarImage
                                                src={booking.academyImage}
                                                alt={booking.academyName}
                                            />
                                            <AvatarFallback className="rounded-lg">
                                                {booking.academyName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-base font-medium text-gray-900">
                                                {booking.academyName}
                                            </span>
                                            <span className="text-sm text-green-600">
                                                {booking.courtName}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm text-gray-900">
                                            {booking.date}
                                        </span>
                                        <span className="text-sm text-gray-900 pt-1">
                                            {booking.time}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-right">
                                    <span className="text-base font-medium text-gray-900">
                                        {booking.payment}
                                    </span>
                                </TableCell>
                                <TableCell className="py-5">
                                    <Badge
                                        variant="secondary"
                                        className={`${getStatusBadgeStyles(booking.status)} rounded-sm`}
                                    >
                                        {booking.statusText}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-6">
                                    <Button
                                        variant="ghost"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-0 h-auto font-normal"
                                        onClick={() => onViewDetails(booking.id)}
                                    >
                                        Xem Chi Tiết
                                    </Button>
                                </TableCell>
                                <TableCell className="py-6">
                                    <Button
                                        variant="ghost"
                                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-0 h-auto font-normal gap-2"
                                        onClick={() => onChat(booking.id)}
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        Chat
                                    </Button>
                                </TableCell>
                                <TableCell className="py-5 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 rounded-full hover:bg-gray-100"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Sửa</DropdownMenuItem>
                                            <DropdownMenuItem>Hủy</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}