import { Link} from "react-router-dom"
import { Settings} from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu"


const CoachDropdownMenuItems = ({ userId }: { userId: string }) => {

    return (
        <>
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer flex-col items-start p-3">
                <Link to={`/coach/coaches/${userId}`} className="flex flex-col">
                    <span className="text-sm text-gray-500 ml-6">Go to Coach Profile</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/coach-dashboard" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </Link>
            </DropdownMenuItem>
        </>
    )
}

export default CoachDropdownMenuItems
