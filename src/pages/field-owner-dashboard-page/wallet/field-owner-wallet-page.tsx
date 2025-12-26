'use client'

import { useEffect } from "react"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getFieldOwnerWallet } from "@/features/wallet"
import { BankAccountManagement } from "./bank-account-management"

export default function FieldOwnerWalletPage() {
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
    <FieldOwnerDashboardLayout>
      <div className="container mx-auto px-6 pb-16">
        <Tabs defaultValue="bank-accounts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="bank-accounts">
              <CreditCard className="w-4 h-4 mr-2" />
              Tài khoản ngân hàng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bank-accounts">
            <BankAccountManagement />
          </TabsContent>
        </Tabs>
      </div>
    </FieldOwnerDashboardLayout>
  )
}
