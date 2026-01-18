"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { PageWrapper } from "@/components/layouts/page-wrapper"

const REFUND_FORM_URL = "https://forms.gle/YYPuoRy853aNiAWf7"

export default function UserRefundPage() {
    useEffect(() => {
        // Redirect to Google Form when component mounts
        window.location.href = REFUND_FORM_URL
    }, [])

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="min-h-screen">
                <UserDashboardHeader />
                <UserDashboardTabs />
                <div className="container mx-auto px-12 py-8">
                    <Card className="bg-white shadow-md rounded-none border-0">
                        <CardHeader className="border-b">
                            <CardTitle className="text-xl font-semibold text-start">
                                Đơn hoàn tiền
                            </CardTitle>
                            <p className="text-gray-600 text-base mt-1.5 text-start">
                                Đang chuyển hướng đến form hoàn tiền...
                            </p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-center text-gray-500">
                                Nếu không tự động chuyển hướng, vui lòng{" "}
                                <a
                                    href={REFUND_FORM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:underline"
                                >
                                    click vào đây
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        </>
    )
}
