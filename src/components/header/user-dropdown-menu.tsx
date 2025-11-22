import { Link } from "react-router-dom"
import { Settings } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu"


const UserDropdownMenuItems = () => {


    return (
        <>
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer flex-col items-start p-3">
                <Link to={`/user-profile`} className="flex flex-col">
                    <span className="text-base text-gray-500 ml-6">Go to Profile</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/user-dashboard" className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    <span className="text-base">Settings</span>
                </Link>
            </DropdownMenuItem>
        </>
    )
}

export default UserDropdownMenuItems
