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
    userId, 
    businessName 
}: FieldOwnerDropdownMenuItemsProps) => {
    return (
        <>
            {/* Profile Section */}
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer flex-col items-start p-3">
                <Link to={`/field-owner/profile/${userId}`} className="flex flex-col">
                    <span className="text-sm text-gray-500 ml-6">
                        {businessName ? `Go to ${businessName} Profile` : 'Go to Profile'}
                    </span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Field Management Section */}
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field/create" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Tạo sân mới</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/fields" className="flex items-center">
                    <List className="mr-2 h-4 w-4" />
                    <span>Quản lý sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/bookings" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Đặt sân</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Analytics & Reports Section */}
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/analytics" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Thống kê & Báo cáo</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/revenue" className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Doanh thu</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Settings & Management Section */}
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/locations" className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Quản lý địa điểm</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/customers" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Khách hàng</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            {/* Settings */}
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/field-owner/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
};

export default FieldOwnerDropdownMenuItems;
