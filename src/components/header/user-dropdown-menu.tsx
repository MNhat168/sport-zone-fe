import { Link } from "react-router-dom"
import { Settings, Building2, FileText, Trophy, ClipboardList, Calendar, User, LayoutDashboard, Layers, Repeat } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu"

const UserDropdownMenuItems = () => {
    return (
        <>
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer flex-col items-start p-3">
                <Link to={`/user-profile`} className="flex flex-col">
                    <span className="text-base text-gray-500 ml-6">Cài đặt tài khoản</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user/single-bookings" className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span className="text-base">Lịch sử đặt sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user/batch-bookings" className="flex items-center">
                    <Layers className="mr-2 h-5 w-5" />
                    <span className="text-base">Đặt sân hàng loạt</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user/recurring-bookings" className="flex items-center">
                    <Repeat className="mr-2 h-5 w-5" />
                    <span className="text-base">Đặt sân cố định</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user/coach-bookings" className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <span className="text-base">Lịch sử thuê HLV</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user/combined-bookings" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    <span className="text-base">Combo Sân + HLV</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 m-1" />
        </>
    )
}

export default UserDropdownMenuItems
