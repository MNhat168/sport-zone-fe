"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Settings, LogOut } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { useAppDispatch } from "@/store/hook"
import { logout } from "@/features/authentication/authSlice"

const CoachDropdownMenuItems = ({ userId }: { userId: string }) => {
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
        const handleLogout = () => {
            dispatch(logout());
            navigate("/login");
        };
    return (
        <>
            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer flex-col items-start p-3">
                <Link to={`/coach/coaches/${userId}`} className="flex flex-col">
                    <span className="text-sm text-gray-500 ml-6">Go to Profile</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-200 m-1" />

            <DropdownMenuItem asChild className="text-black hover:text-primary-800 cursor-pointer">
                <Link to="/coach/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
                className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                onClick={() => setOpenLogoutDialog(true)}
            >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
            </DropdownMenuItem>

            <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
                <DialogContent className="bg-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-base">Bạn có chắc chắn muốn đăng xuất không?</div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleLogout}>
                            Xác nhận
                        </Button>
                        <Button variant="outline" onClick={() => setOpenLogoutDialog(false)}>
                            Hủy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CoachDropdownMenuItems
