import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs"
import { FieldOwnerDashboardTabs } from "@/components/tabs/field-owner-dashboard-tabs"
import {CoachDashboardTabs} from "@/components/tabs/coach-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import {PageWrapper} from "@/components/layouts/page-wrapper"
import ProfileTabs from "@/components/tabs/profile-tabs"
import { useAppSelector } from "@/store/hook"

export default function UserProfilePage() {
    const authUser = useAppSelector((state) => state.auth.user)
    const userRole = authUser?.role

    // Render appropriate dashboard tabs based on role
    const renderDashboardTabs = () => {
        switch (userRole) {
            case 'field_owner':
                return <FieldOwnerDashboardTabs />
            case 'coach':
                return <CoachDashboardTabs />
            case 'user':
            default:
                return <UserDashboardTabs />
        }
    }

    // Render appropriate header based on role
    const renderHeader = () => {
        switch (userRole) {
            case 'field_owner':
                return <UserDashboardHeader />
            case 'coach':
                // TODO: Add CoachDashboardHeader when available
                return <UserDashboardHeader />
            case 'user':
            default:
                return <UserDashboardHeader />
        }
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                {/* Header Section */}
                {renderHeader()}

                {/* Navigation Tabs */}
                {renderDashboardTabs()}

                <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col items-center gap-10 pt-12">
                    {/* Main Content */}
                    <div className="w-full max-w-[1320px] px-3">
                        <ProfileTabs />
                    </div>
                </div>
            </PageWrapper>
        </>
    )
}
