import { Link } from "react-router-dom";
import { 
    Settings, 
    Plus, 
    List, 
    BarChart3, 
    Calendar,
    MapPin,
    DollarSign,
    User
} from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

/**
 * Props for FieldOwnerDropdownMenuItems component
 */
interface FieldOwnerDropdownMenuItemsProps {
    /**
     * Field owner user ID
     */
    userId: string;
    /**
     * Field owner business name (optional)
     */
    businessName?: string;
}

/**
 * FieldOwnerDropdownMenuItems component - Dropdown menu items for field owners
 */
const FieldOwnerDropdownMenuItems = ({  
    businessName 
}: FieldOwnerDropdownMenuItemsProps) => {
    return (
        <>
            {/* Profile Section */}
            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer flex-col items-start p-3">
                <Link to="/field-owner/profile" className="flex flex-col">
                    <span className="text-base text-gray-500 ml-6">
                        {businessName ? `Go to ${businessName} Profile` : 'Go to Profile'}
                    </span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Field Management Section */}
            <DropdownMenuItem asChild className="text-black hover:text-green-800 cursor-pointer">
                <Link to="/field/create" className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="text-base">Tạo sân mới</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-green-800 cursor-pointer">
                <Link to="/field-owner/fields" className="flex items-center">
                    <List className="mr-2 h-5 w-5" />
                    <span className="text-base">Danh sách sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/bookings" className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span className="text-base">Đặt sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Analytics & Reports Section */}
            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/analytics" className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    <span className="text-base">Thống kê & Báo cáo</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/revenue" className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    <span className="text-base">Doanh thu</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Settings & Management Section */}
            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/locations" className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    <span className="text-base">Quản lý địa điểm</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/customers" className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    <span className="text-base">Khách hàng</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Settings */}
            <DropdownMenuItem asChild className="text-black hover:!text-green-800 cursor-pointer">
                <Link to="/field-owner/settings" className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    <span className="text-base">Cài đặt</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
};

export default FieldOwnerDropdownMenuItems;
