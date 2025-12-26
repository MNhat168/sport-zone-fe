import { Link } from "react-router-dom"
import { Settings, Building2, FileText, Trophy, ClipboardList } from "lucide-react"
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
                <Link to="/user-dashboard" className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    <span className="text-base">Dashboard</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-green-600 cursor-pointer bg-green-50">
                <Link to="/become-field-owner" className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-green-600" />
                    <span className="text-base font-semibold text-green-600">Trở thành chủ sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-blue-600 cursor-pointer">
                <Link to="/field-owner-registration-status" className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    <span className="text-base text-blue-600">Xem trạng thái đăng ký</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-orange-600 cursor-pointer bg-orange-50">
                <Link to="/become-coach" className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-orange-600" />
                    <span className="text-base font-semibold text-orange-600">Trở thành huấn luyện viên</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-orange-600 cursor-pointer">
                <Link to="/coach-registration-status" className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-orange-600" />
                    <span className="text-base text-orange-600">Trạng thái đăng ký HLV</span>
                </Link>
            </DropdownMenuItem>
        </>
    )
}

export default UserDropdownMenuItems
