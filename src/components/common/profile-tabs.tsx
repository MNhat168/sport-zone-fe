import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hook"

// Import all profile components
import Profile from "@/components/profile/profile"
import ChangePassword from "@/components/profile/change-password"
import OtherSetting from "@/components/profile/other-setting"
import FieldOwnerTab from "@/components/profile/field-owner-tab"
import CoachProfileTab from "@/components/profile/coach-profile-tab"

export interface ProfileTabConfig {
    id: string
    label: string
    component: React.ComponentType
    requiredRole?: string
    showForRoles?: string[]
}

// Default tabs available for all users
const defaultTabs: ProfileTabConfig[] = [
    {
        id: 'profile',
        label: 'Profile',
        component: Profile,
    },
    {
        id: 'change-password',
        label: 'Change Password',
        component: ChangePassword,
    },
    {
        id: 'other-settings',
        label: 'Other Settings',
        component: OtherSetting,
    },
]

// Role-specific tabs
const roleSpecificTabs: ProfileTabConfig[] = [
    {
        id: 'field-owner',
        label: 'Field Owner',
        component: FieldOwnerTab,
        requiredRole: 'field_owner',
    },
    {
        id: 'coach-profile',
        label: 'Coach Profile',
        component: CoachProfileTab,
        requiredRole: 'coach',
    },
    // Có thể thêm tabs cho manager, admin, etc. ở đây
]

interface ProfileTabsProps {
    initialTab?: string
    className?: string
    onTabChange?: (tabId: string) => void
}

export default function ProfileTabs({ 
    initialTab = 'profile', 
    className = "",
    onTabChange 
}: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState(initialTab)
    const authUser = useAppSelector((state) => state.auth.user)
    const userRole = authUser?.role

    // Filter tabs based on user role
    const getAvailableTabs = () => {
        const availableTabs = [...defaultTabs]
        
        // Add role-specific tabs
        roleSpecificTabs.forEach(tab => {
            if (tab.requiredRole && userRole === tab.requiredRole) {
                availableTabs.push(tab)
            }
        })
        
        return availableTabs
    }

    const availableTabs = getAvailableTabs()

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        onTabChange?.(tabId)
    }

    const renderActiveComponent = () => {
        const currentTab = availableTabs.find(tab => tab.id === activeTab)
        if (!currentTab) {
            // Fallback to first available tab
            const firstTab = availableTabs[0]
            if (firstTab) {
                const Component = firstTab.component
                return <Component />
            }
            return null
        }
        
        const Component = currentTab.component
        return <Component />
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Tab Navigation */}
            <div className="w-full flex flex-wrap items-start gap-0 mb-10">
                {availableTabs.map((tab, index) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        onClick={() => handleTabChange(tab.id)}
                        className={activeTab === tab.id 
                            ? "px-7 py-4 bg-gray-800 hover:bg-gray-700 rounded-[5px] text-white text-base font-normal"
                            : `px-7 py-4 bg-white hover:bg-gray-50 rounded-[5px] text-[#6B7385] text-base font-normal border-gray-200 ${
                                index > 0 ? 'ml-5' : ''
                            }`
                        }
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Component Content */}
            {renderActiveComponent()}
        </div>
    )
}
