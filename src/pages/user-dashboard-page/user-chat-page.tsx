import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserChatPage() {
  return (
    <>
      <NavbarDarkComponent />
      <div className="min-h-screen">
        {/* Header Section */}
        <UserDashboardHeader />

        {/* Navigation Tabs */}
        <UserDashboardTabs />
        <div className="container mx-auto px-12 py-8">
          <div className="space-y-8">
            <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold mb-2 text-start">Trò chuyện</CardTitle>
                <p className="text-muted-foreground text-start">Giao tiếp với huấn luyện viên và chủ sân</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">Chức năng trò chuyện sẽ được triển khai tại đây.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
