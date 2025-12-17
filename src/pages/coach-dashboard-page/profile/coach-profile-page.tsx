"use client"

import { useState } from "react"
import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import { User, Trophy, Lock } from "lucide-react"
import Profile from "@/components/profile/profile"
import CoachProfileTab from "@/components/profile/coach-profile-tab"
import ChangePassword from "@/components/profile/change-password"

type TabType = "personal" | "coach" | "password"

export default function CoachProfilePage() {
    const [activeTab, setActiveTab] = useState<TabType>("personal")

    const tabs = [
        {
            id: "personal" as TabType,
            label: "Thông tin cá nhân",
            icon: User,
        },
        {
            id: "coach" as TabType,
            label: "Thông tin huấn luyện viên",
            icon: Trophy,
        },
        {
            id: "password" as TabType,
            label: "Đổi mật khẩu",
            icon: Lock,
        },
    ]

    return (
        <CoachDashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
                    <p className="text-gray-600 mt-2">
                        Quản lý thông tin cá nhân và thông tin huấn luyện viên của bạn
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${
                                            isActive
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === "personal" && (
                        <div className="space-y-6">
                            <Profile />
                        </div>
                    )}

                    {activeTab === "coach" && (
                        <div className="space-y-6">
                            <CoachProfileTab />
                        </div>
                    )}

                    {activeTab === "password" && (
                        <div className="space-y-6">
                            <ChangePassword />
                        </div>
                    )}
                </div>
            </div>
        </CoachDashboardLayout>
    )
}
