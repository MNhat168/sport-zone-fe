import { useState } from "react"
import { UserDashboardTabs } from "@/components/ui/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { Button } from "@/components/ui/button"
import Profile from "./components/profile"
import ChangePassword from "./components/change-password"
import OtherSetting from "./components/other-setting"
import {PageWrapper} from "@/components/layouts/page-wrapper"

export default function UserProfileTab() {
    const [activeTab, setActiveTab] = useState('profile')

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'profile':
                return <Profile />
            case 'change-password':
                return <ChangePassword />
            case 'other-settings':
                return <OtherSetting /> 
            default:
                return <Profile />
        }
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                {/* Header Section */}
                <UserDashboardHeader />

                {/* Navigation Tabs */}
                <UserDashboardTabs />

                <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col items-center gap-10 pt-12">
                    {/* Main Content */}
                    <div className="w-full max-w-[1320px] px-3">
                        {/* Tab Navigation */}
                        <div className="w-full flex flex-wrap items-start gap-0 mb-10">
                            <Button
                                variant={activeTab === 'profile' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('profile')}
                                className={activeTab === 'profile' 
                                    ? "px-7 py-4 bg-gray-800 hover:bg-gray-700 rounded-[5px] text-white text-base font-normal "
                                    : "px-7 py-4 bg-white hover:bg-gray-50 rounded-[5px] text-[#6B7385] text-base font-normal  border-gray-200"
                                }
                            >
                                Profile
                            </Button>
                            <Button
                                variant={activeTab === 'change-password' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('change-password')}
                                className={activeTab === 'change-password' 
                                    ? "ml-5 px-7 py-4 bg-gray-800 hover:bg-gray-700 rounded-[5px] text-white text-base font-normal "
                                    : "ml-5 px-7 py-4 bg-white hover:bg-gray-50 rounded-[5px] text-[#6B7385] text-base font-normal  border-gray-200"
                                }
                            >
                                Change Password
                            </Button>
                            <Button
                                variant={activeTab === 'other-settings' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('other-settings')}
                                className={activeTab === 'other-settings' 
                                    ? "ml-5 px-7 py-4 bg-gray-800 hover:bg-gray-700 rounded-[5px] text-white text-base font-normal "
                                    : "ml-5 px-7 py-4 bg-white hover:bg-gray-50 rounded-[5px] text-[#6B7385] text-base font-normal  border-gray-200"
                                }
                            >
                                Other Settings
                            </Button>
                        </div>

                        {/* Component Content */}
                        {renderActiveComponent()}
                    </div>
                </div>
            </PageWrapper>
        </>
    )
}