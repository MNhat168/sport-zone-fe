'use client'

import { useEffect } from "react"
import { RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getFieldOwnerWallet } from "@/features/wallet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BankAccountManagement } from "./bank-account-management"

export default function CoachWalletPage() {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const userId = authUser?._id ?? null

  const {
    fieldOwnerWalletError: error,
  } = useAppSelector((state) => state.wallet)

  // Fetch wallet on mount
  useEffect(() => {
    if (userId) {
      dispatch(getFieldOwnerWallet(userId))
    }
  }, [userId, dispatch])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  return (
    <CoachDashboardLayout>
      <div className="container mx-auto px-6 pb-16">
        <Tabs defaultValue="bank-accounts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="bank-accounts">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tài khoản ngân hàng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bank-accounts">
            <BankAccountManagement />
          </TabsContent>
        </Tabs>
      </div>
    </CoachDashboardLayout>
  )
}
