import { FieldOwnerDashboardTabs } from "@/components/ui/field-owner-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { FieldOwnerDashboardHeader } from "@/components/header/field-owner-dashboard-header"
import {PageWrapper} from "@/components/layouts/page-wrapper"
import ProfileTabs from "@/components/common/profile-tabs"

export default function FieldOwnerProfileTab() {
    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                {/* Header Section */}
                <FieldOwnerDashboardHeader />

                {/* Navigation Tabs */}
                <FieldOwnerDashboardTabs />

                <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col items-center gap-10 pt-12">
                    {/* Main Content */}
                    <div className="w-full max-w-[1320px] px-3">
                        <ProfileTabs initialTab="field-owner" />
                    </div>
                </div>
            </PageWrapper>
        </>
    )
}
